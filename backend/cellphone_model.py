import cv2
import numpy as np
from ultralytics import YOLO
import mediapipe as mp
from filterpy.kalman import KalmanFilter

# Initialize models
model = YOLO("yolov8n.pt")
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=2, min_detection_confidence=0.5)
kf = KalmanFilter(dim_x=4, dim_z=2)
kf.x = np.array([0, 0, 0, 0], dtype=float)  # [x, y, vx, vy]
kf.F = np.array([[1, 0, 1, 0], [0, 1, 0, 1], [0, 0, 1, 0], [0, 0, 0, 1]])
kf.H = np.array([[1, 0, 0, 0], [0, 1, 0, 0]])
kf.P *= 1000
kf.R = np.array([[5, 0], [0, 5]])
kf.Q = np.eye(4) * 0.1

# Globals
prev_bbox = None
prev_gray = None
state_history = []

def get_hand_bbox(landmarks, shape):
    x_coords = [lm.x * shape[1] for lm in landmarks.landmark]
    y_coords = [lm.y * shape[0] for lm in landmarks.landmark]
    return [min(x_coords), min(y_coords), max(x_coords), max(y_coords)]

def iou(box1, box2):
    x1, y1, x2, y2 = box1
    x1_b, y1_b, x2_b, y2_b = box2
    xi1, yi1 = max(x1, x1_b), max(y1, y1_b)
    xi2, yi2 = min(x2, x2_b), min(y2, y2_b)
    inter_area = max(0, xi2 - xi1) * max(0, yi2 - yi1)
    box1_area = (x2 - x1) * (y2 - y1)
    box2_area = (x2_b - x1_b) * (y2_b - y1_b)
    return inter_area / (box1_area + box2_area - inter_area) if (box1_area + box2_area - inter_area) > 0 else 0

def is_phone_in_hand(frame, bbox):
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)
    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            hand_box = get_hand_bbox(hand_landmarks, frame.shape)
            if iou(bbox, hand_box) > 0.3:
                return True
    return False

def check_cellphone(frame):
    global prev_bbox, prev_gray, state_history
    
    # Input validation
    if frame is None or frame.size == 0:
        return "Cellphone Absent", 0.99
    
    # Convert to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Initialize prev_gray
    if prev_gray is None:
        prev_gray = gray.copy()
        return "Cellphone Absent", 0.99
    
    # 1. YOLOv8n Cellphone Detection
    results = model(frame, verbose=False)
    boxes = results[0].boxes
    yolo_cellphone = False
    yolo_conf = 0.0
    current_bbox = None
    cellphones = [(box.xyxy.cpu().numpy().astype(int)[0], float(box.conf)) for box in boxes if int(box.cls) == 67 and box.conf > 0.3]
    if cellphones:
        current_bbox, yolo_conf = max(cellphones, key=lambda x: x[1])
        yolo_cellphone = True
    
    if not yolo_cellphone:
        prev_gray = gray.copy()
        prev_bbox = None
        state_history.append("Cellphone Absent")
        if len(state_history) > 5:
            state_history.pop(0)
        return "Cellphone Absent", 0.99
    
    # 2. Edge Detection
    edges = cv2.Canny(gray, 100, 200)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    rectangle_detected = False
    for contour in contours:
        if cv2.contourArea(contour) > 0.01 * frame.shape[0] * frame.shape[1]:
            approx = cv2.approxPolyDP(contour, 0.02 * cv2.arcLength(contour, True), True)
            if len(approx) == 4:
                x, y, w, h = cv2.boundingRect(approx)
                aspect_ratio = w / h if w > h else h / w
                if 1.5 <= aspect_ratio <= 2.5:
                    rectangle_detected = True
                    break
    
    # 3. Color Histogram
    roi = frame[current_bbox[1]:current_bbox[3], current_bbox[0]:current_bbox[2]] if current_bbox is not None else frame
    hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
    hist = cv2.calcHist([hsv], [2], None, [256], [0, 256])
    roi_area = (current_bbox[2] - current_bbox[0]) * (current_bbox[3] - current_bbox[1]) if current_bbox is not None else frame.size
    glow_detected = np.sum(hist[200:]) > (0.01 * roi_area)
    hist_hue = cv2.calcHist([hsv], [0], None, [180], [0, 180])
    hist_sat = cv2.calcHist([hsv], [1], None, [256], [0, 256])
    colorful_screen = np.sum(hist_hue[0:30]) > 500 and np.sum(hist_sat[100:]) > 1000
    glow_detected = glow_detected or colorful_screen
    
    # 4. Hand Detection
    in_hand = is_phone_in_hand(frame, current_bbox)
    
    # 5. Motion Consistency
    motion_consistent = False
    if prev_bbox is None:
        kf.x[:2] = [(current_bbox[0] + current_bbox[2]) / 2, (current_bbox[1] + current_bbox[3]) / 2]
        motion_consistent = True
    else:
        kf.predict()
        curr_center = np.array([(current_bbox[0] + current_bbox[2]) / 2, (current_bbox[1] + current_bbox[3]) / 2])
        kf.update(curr_center)
        predicted_center = kf.x[:2]
        distance = np.linalg.norm(predicted_center - curr_center)
        motion_consistent = distance < 50
    
    # Update globals
    prev_gray = gray.copy()
    prev_bbox = current_bbox
    
    # Decision Logic
    state = "Cellphone Present" if yolo_cellphone and in_hand and (rectangle_detected or glow_detected) and motion_consistent else "Cellphone Absent"
    state_history.append(state)
    if len(state_history) > 5:
        state_history.pop(0)
    final_state = max(set(state_history), key=state_history.count)
    conf = max(0.95, yolo_conf) if final_state == "Cellphone Present" else 0.99
    
    return final_state, conf
# Example usage

import numpy as np
# from ultralytics import YOLO

# # Load YOLOv8n Model
# model = YOLO("yolov8n.pt")

# # Globals for motion consistency
# prev_bbox = None
# prev_gray = None

# def check_cellphone(frame):
#     global prev_bbox, prev_gray
    
#     # Convert to grayscale
#     gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
#     # Initialize prev_gray if None
#     if prev_gray is None:
#         prev_gray = gray.copy()
#         return "Cellphone Absent", 0.99
    
#     # 1. YOLOv8n Cellphone Detection
#     results = model(frame, verbose=False)
#     boxes = results[0].boxes
#     yolo_cellphone = False
#     yolo_conf = 0.0
#     current_bbox = None
#     for box in boxes:
#         if int(box.cls) == 67 and box.conf > 0.5:
#             yolo_cellphone = True
#             yolo_conf = float(box.conf)
#             current_bbox = box.xyxy.cpu().numpy().astype(int)[0]
#             break
    
#     if not yolo_cellphone:
#         prev_gray = gray.copy()
#         prev_bbox = None
#         return "Cellphone Absent", 0.99
    
#     # 2. Edge Detection
#     edges = cv2.Canny(gray, 100, 200)
#     contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
#     rectangle_detected = False
#     for contour in contours:
#         if cv2.contourArea(contour) > 1000:
#             approx = cv2.approxPolyDP(contour, 0.02 * cv2.arcLength(contour, True), True)
#             if len(approx) == 4:
#                 rectangle_detected = True
#                 break
    
#     # 3. Color Histogram
#     roi = frame[current_bbox[1]:current_bbox[3], current_bbox[0]:current_bbox[2]] if current_bbox is not None else frame
#     hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
#     hist = cv2.calcHist([hsv], [2], None, [256], [0, 256])
#     glow_detected = np.sum(hist[200:]) > 1000
    
#     # 4. Motion Consistency
#     motion_consistent = False
#     if prev_bbox is not None and current_bbox is not None:
#         prev_center = ((prev_bbox[0] + prev_bbox[2]) // 2, (prev_bbox[1] + prev_bbox[3]) // 2)
#         curr_center = ((current_bbox[0] + current_bbox[2]) // 2, (current_bbox[1] + current_bbox[3]) // 2)
#         distance = np.sqrt((curr_center[0] - prev_center[0])**2 + (curr_center[1] - prev_center[1])**2)
#         motion_consistent = distance < 50
    
#     # Update globals
#     prev_gray = gray.copy()
#     prev_bbox = current_bbox
    
#     # Decision Logic
#     if yolo_cellphone and (rectangle_detected or glow_detected) and (motion_consistent or prev_bbox is None):
#         return "Cellphone Present", max(0.95, yolo_conf)
    
#     return "Cellphone Absent", 0.99