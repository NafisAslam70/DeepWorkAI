from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from PIL import Image
import io
from ultralytics import YOLO
import mediapipe as mp
from absence_model import check_presence
from cellphone_model import check_cellphone

app = Flask(__name__)
CORS(app)

# === Load Model ===
classifier = YOLO("best.pt")  # YOLOv11n-cls
phone_detector = YOLO("yolov8n.pt") 

# === MediaPipe Gaze Tracker Setup ===
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)

def detect_phone_yolov8(frame, conf_thres=0.25):
    """Return (True, max_conf) if COCO class 67 ‘cell phone’ is detected."""
    result = phone_detector(frame)[0]
    max_conf = 0.0
    for box in result.boxes:
        if int(box.cls[0]) == 67:            # COCO label id for ‘cell phone’
            max_conf = max(max_conf, float(box.conf[0]))
    return max_conf > conf_thres, max_conf


def gaze_is_away(image):
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb)
    if results.multi_face_landmarks:
        for face in results.multi_face_landmarks:
            lm = face.landmark
            left_eye = lm[33]
            right_eye = lm[133]
            iris = lm[468]
            width = right_eye.x - left_eye.x
            if width == 0:
                return False
            iris_pos = (iris.x - left_eye.x) / width
            return not (0.35 <= iris_pos <= 0.65)
    return False

@app.route('/deepwork_focus', methods=['POST'])
def deepwork_focus():
    try:
        # === Load image from POST ===
        image_file = request.files['image']
        image_bytes = image_file.read()
        pil_image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        frame = np.array(pil_image)

        # === Absence Check ===
        presence_state, presence_conf, presence_reason = check_presence(frame)
        if presence_state == "Absent":
            return jsonify({
                "focusState": "Distracted",
                "reason": "Absent",
                "confidence": round(presence_conf, 2),
                "focusLevel": 0
            })
        elif presence_state == "Present without Face":
            return jsonify({
                "focusState": "Distracted",
                "reason": "Likely Distraction: Full face not visible",
                "confidence": round(presence_conf, 2),
                "focusLevel": 5
            })

        # === Cellphone Check ===
        cellphone_state, cellphone_conf = check_cellphone(frame)
        if cellphone_state == "Cellphone Present":
            return jsonify({
                "focusState": "Distracted",
                "reason": "Phone",
                "confidence": round(cellphone_conf, 2),
                "focusLevel": 2
            })

        # === Run classification model ===
        results = classifier(frame)
        probs = results[0].probs
        class_id = probs.top1
        confidence = float(probs.top1conf)
        class_name = classifier.names[class_id]

        # === Handle YOLOv11n-cls classes ===
        # if class_name == "Phone":
            # Re-run cellphone check
            # cellphone_state, cellphone_conf = check_cellphone(frame)
            # if cellphone_state == "Cellphone Present":
            #     return jsonify({
            #         "focusState": "Distracted",
            #         "reason": "Phone",
            #         "confidence": round(cellphone_conf, 2),
            #         "focusLevel": 2
            #     })

            # focus_state = "Distracted"
            # reason = "Phone"
            # confidence = round(confidence, 2)

            # Re-verify with YOLO-v8 detector
            #     phone_found, det_conf = detect_phone_yolov8(frame)
            #     if phone_found:
            #         return jsonify(
            #             focusState="Distracted",
            #             reason="Phone",
            #             confidence=round(det_conf, 2),
            #             focusLevel=3,
            #         )
            #     # If YOLO-v8 sees no phone, treat as focused (false positive guard)
            #     class_name = "Focused"
            #     confidence = round(confidence, 2)

        if class_name in ["Drowsy", "LookingAway"]:
            focus_state = "Distracted"
            reason = "Likely distraction: drowsy/lookingaway/badposture"
            confidence = round(confidence, 2)
            
        # elif class_name == "Phone":
        #     focus_state = "Distracted"
        #     reason = "Phone"
        #     confidence = round(confidence, 2)
        # elif class_name == "Phone" and detect_phone_yolov8(frame):
        #     focus_state = "Distracted"
        #     reason = "Phone"
        #     confidence = round(confidence, 2)



        elif class_name == "Absent":
            focus_state = "Distracted"
            reason = "Likely Distraction: Full face not visible"

        else:
            focus_state = "Focused"
            reason = None
            confidence = round(confidence, 2)

        # === Assign focus level based on direct prediction ===
        if class_name == "Focused":
            focus_level = 10
        elif class_name == "Phone":
            focus_level = 9
        elif class_name == "BadPosture":
            focus_level = 8
        elif class_name == "Absent":
            focus_level = 10
        elif class_name in ["Drowsy", "LookingAway"]:
            focus_level = 6
        else:
            focus_level = 3  # Default for other distractions

        return jsonify({
            "focusState": focus_state,
            "reason": reason,
            "confidence": confidence,
            "focusLevel": focus_level
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import cv2
# import numpy as np
# from PIL import Image
# import io
# from ultralytics import YOLO
# import mediapipe as mp
# from absence_model import check_presence
# from cellphone_model import check_cellphone

# app = Flask(__name__)
# CORS(app)

# # === Load Model ===
# classifier = YOLO("best.pt")  # YOLOv11n-cls

# # === MediaPipe Gaze Tracker Setup ===
# mp_face_mesh = mp.solutions.face_mesh
# face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)

# def gaze_is_away(image):
#     rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
#     results = face_mesh.process(rgb)
#     if results.multi_face_landmarks:
#         for face in results.multi_face_landmarks:
#             lm = face.landmark
#             left_eye = lm[33]
#             right_eye = lm[133]
#             iris = lm[468]
#             width = right_eye.x - left_eye.x
#             if width == 0:
#                 return False
#             iris_pos = (iris.x - left_eye.x) / width
#             return not (0.35 <= iris_pos <= 0.65)
#     return False

# @app.route('/deepwork_focus', methods=['POST'])
# def deepwork_focus():
#     try:
#         # === Load image from POST ===
#         image_file = request.files['image']
#         image_bytes = image_file.read()
#         pil_image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
#         frame = np.array(pil_image)

#         # === Absence Check ===
#         presence_state, presence_conf, presence_reason = check_presence(frame)
#         if presence_state == "Absent":
#             return jsonify({
#                 "focusState": "Distracted",
#                 "reason": "Absent",
#                 "confidence": round(presence_conf, 2),
#                 "focusLevel": 0
#             })
#         elif presence_state == "Present without Face":
#             return jsonify({
#                 "focusState": "Distracted",
#                 "reason": "Likely Distraction: Full face not visible",
#                 "confidence": round(presence_conf, 2),
#                 "focusLevel": 5
#             })

#         # === Cellphone Check ===
#         cellphone_state, cellphone_conf = check_cellphone(frame)
#         if cellphone_state == "Cellphone Present":
#             return jsonify({
#                 "focusState": "Distracted",
#                 "reason": "Phone",
#                 "confidence": round(cellphone_conf, 2),
#                 "focusLevel": 2
#             })

#         # === Run classification model ===
#         results = classifier(frame)
#         probs = results[0].probs
#         class_id = probs.top1
#         confidence = float(probs.top1conf)
#         class_name = classifier.names[class_id]

#         # === Handle YOLOv11n-cls classes ===
#         # if class_name in ["BadPosture", "Focused"]:
#         #     focus_state = "Focused"
#         #     reason = None
#         #     confidence = 0.95
#         # elif class_name=="Absent":
#         #     focus_state = "Distracted"
#         #     reason = "Y: Likely distraction: Wrong Face Alignment"
#         #     confidence = 0.95
#         if class_name in ["Drowsy", "LookingAway", "Absent"]:
#             # if class_name == "LookingAway":
#             #     focus_state = "Focused"
#             #     reason = None
#             #     confidence = 0.95
#             # else:
#                 focus_state = "Distracted"
#                 reason = "Likely distraction: drowsy/lookingaway/badposture"
#                 confidence = round(confidence, 2)
#         # elif class_name=="Absent":
#         #         focus_state = "Distracted"
#         #         reason = "Likely Distraction: Full face not visible"
#         elif class_name=="Phone":
#                 focus_state = "Distracted"
#                 reason = "Phone"
#         else:
#             focus_state = "Focused"
#             reason = None
#             confidence = round(confidence, 2)

#         # === Assign focus level based on direct prediction ===
#         if class_name == "Focused":
#             focus_level = 10
#         elif class_name == "Phone":
#             focus_level = 9
#         elif class_name == "BadPosture":
#             focus_level = 8
#         elif class_name == "Absent":
#             focus_level = 7

#         elif class_name in ["Drowsy", "LookingAway"]:
#             # if class_name == "LookingAway" and not gaze_is_away(frame):
#             #     focus_level = 10  # Treated as "Focused"
#             # else:
#                 focus_level = 6
#         else:
#             focus_level = 3  # Default for other distractions

#         return jsonify({
#             "focusState": focus_state,
#             "reason": reason,
#             "confidence": confidence,
#             "focusLevel": focus_level
#         })

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# if __name__ == '__main__':
#     app.run(debug=True, port=5000)
