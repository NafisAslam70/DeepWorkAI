
import cv2
import numpy as np
from collections import deque
import time

# Haar Cascade for Face Detection
haar_cascade_frontal = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
haar_cascade_profile = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')

# Globals for motion detection and smoothing
prev_gray = None
absence_buffer = deque(maxlen=100)  # Store (state, timestamp) pairs

def check_presence(frame):
    global prev_gray, absence_buffer
    
    # Convert to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Initialize prev_gray if None (first frame)
    if prev_gray is None:
        prev_gray = gray.copy()
        absence_buffer.append(("Present with Face", time.time()))
        return "Present with Face", 0.95, None
    
    # 1. Frame Variance
    variance = np.var(gray)
    variance_absent = variance < 100
    
    # 2. Mean Pixel Intensity
    mean_intensity = np.mean(gray)
    intensity_absent = mean_intensity < 10
    
    # 3. Motion Detection
    frame_diff = cv2.absdiff(gray, prev_gray)
    thresh = cv2.threshold(frame_diff, 25, 255, cv2.THRESH_BINARY)[1]
    motion_pixels = np.sum(thresh) / 255
    motion_absent = motion_pixels < 1000
    
    # 4. Haar Cascade Face Detection
    frontal_faces = haar_cascade_frontal.detectMultiScale(gray, scaleFactor=1.03, minNeighbors=3, minSize=(30, 30))
    profile_faces = haar_cascade_profile.detectMultiScale(gray, scaleFactor=1.03, minNeighbors=3, minSize=(30, 30))
    faces_detected = len(frontal_faces) > 0 or len(profile_faces) > 0
    
    # Update prev_gray
    prev_gray = gray.copy()
    
    # Determine current state
    if variance_absent or intensity_absent or (motion_absent and not faces_detected):
        current_state = "Absent"
        current_conf = 0.99
        current_reason = "Absent"
    elif faces_detected and not variance_absent and not intensity_absent and not motion_absent:
        current_state = "Present with Face"
        current_conf = 0.95
        current_reason = None
    elif not variance_absent and not intensity_absent and not motion_absent:
        current_state = "Present without Face"
        current_conf = 0.90
        current_reason = "Likely Distraction: Full face not visible"
    else:
        current_state = "Present with Face"
        current_conf = 0.99
        current_reason = None
    
    # Add to absence buffer
    absence_buffer.append((current_state, time.time()))
    
    # Clear buffer if non-Absent to reset smoothing
    if current_state != "Absent":
        absence_buffer.clear()
        absence_buffer.append((current_state, time.time()))
    
    return current_state, current_conf, current_reason

# import cv2
# import numpy as np
# from collections import deque
# import time

# # Haar Cascade for Face Detection
# haar_cascade_frontal = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
# haar_cascade_profile = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')

# # Globals for motion detection and smoothing
# prev_gray = None
# absence_buffer = deque(maxlen=100)  # Store (state, timestamp) pairs

# def check_presence(frame):
#     global prev_gray, absence_buffer
    
#     # Convert to grayscale
#     gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
#     # Initialize prev_gray if None (first frame)
#     if prev_gray is None:
#         prev_gray = gray.copy()
#         absence_buffer.append(("Present with Face", time.time()))
#         return "Present with Face", 0.95, None
    
#     # 1. Frame Variance
#     variance = np.var(gray)
#     variance_absent = variance < 100
    
#     # 2. Mean Pixel Intensity
#     mean_intensity = np.mean(gray)
#     intensity_absent = mean_intensity < 10
    
#     # 3. Motion Detection
#     frame_diff = cv2.absdiff(gray, prev_gray)
#     thresh = cv2.threshold(frame_diff, 25, 255, cv2.THRESH_BINARY)[1]
#     motion_pixels = np.sum(thresh) / 255
#     motion_absent = motion_pixels < 1000
    
#     # 4. Haar Cascade Face Detection
#     frontal_faces = haar_cascade_frontal.detectMultiScale(gray, scaleFactor=1.03, minNeighbors=3, minSize=(30, 30))
#     profile_faces = haar_cascade_profile.detectMultiScale(gray, scaleFactor=1.03, minNeighbors=3, minSize=(30, 30))
#     faces_detected = len(frontal_faces) > 0 or len(profile_faces) > 0
    
#     # Update prev_gray
#     prev_gray = gray.copy()
    
#     # Determine current state
#     if variance_absent or intensity_absent or (motion_absent and not faces_detected):
#         current_state = "Absent"
#         current_conf = 0.99
#         current_reason = "Absent"
#     elif faces_detected and not variance_absent and not intensity_absent and not motion_absent:
#         current_state = "Present with Face"
#         current_conf = 0.95
#         current_reason = None
#     elif not variance_absent and not intensity_absent and not motion_absent:
#         current_state = "Present without Face"
#         current_conf = 0.90
#         current_reason = "Alert: Adjust camera to show face"
#     else:
#         current_state = "Absent"
#         current_conf = 0.99
#         current_reason = "Absent"
    
#     # Add to absence buffer
#     absence_buffer.append((current_state, time.time()))
    
#     # Smoothing for Absent: Check if Absent for at least 3 seconds
#     if current_state == "Absent":
#         # Remove entries older than 3 seconds
#         while absence_buffer and time.time() - absence_buffer[0][1] > 1:
#             absence_buffer.popleft()
        
#         # Confirm Absent only if all recent states are Absent
#         if all(state == "Absent" for state, _ in absence_buffer) and len(absence_buffer) >= 3:  # Ensure some history
#             return "Absent", 0.99, "Absent"
#         else:
#             # Return last non-Absent state if available, else default to Present
#             for state, _ in reversed(absence_buffer):
#                 if state == "Present with Face":
#                     return "Present with Face", 0.95, None
#                 elif state == "Present without Face":
#                     return "Present without Face", 0.90, "Alert: Adjust camera to show face"
#             return "Present with Face", 0.95, None
    
#     # Clear buffer if non-Absent to reset smoothing
#     if current_state != "Absent":
#         absence_buffer.clear()
#         absence_buffer.append((current_state, time.time()))
    
#     return current_state, current_conf, current_reason