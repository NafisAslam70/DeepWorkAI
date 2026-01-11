import requests
import base64

# Path to the image file
image_path = "awake.dc314e3a-7acb-11ef-914c-92c2f4953442.jpg"

# Read the image and convert it to base64
with open(image_path, "rb") as image_file:
    base64_image = base64.b64encode(image_file.read()).decode('utf-8')

# Prepare the request payload
payload = {
    "image": f"data:image/jpeg;base64,{base64_image}"
}

# Send the request to the API
response = requests.post("http://127.0.0.1:5000/yolo_inference", json=payload)

# Print the response
print(response.json())

#curl -X POST -F "image=@/Users/nafisaslam/Desktop/d_test_image2.jpg" http://127.0.0.1:5000/yolo_inference

