from PIL import Image
import matplotlib.pyplot as plt

# Load the image
image_path = "/mnt/data/image.png"
image = Image.open(image_path)

# Convert to RGBA to remove background (if exists)
image = image.convert("RGBA")
data = image.getdata()

# Process and remove background (make it transparent where color is close to black background)
new_data = []
for item in data:
    # Define background range to make transparent
    if item[:3] == (15, 24, 40):  # RGB range (blackish background)
        new_data.append((0, 0, 0, 0))  # Transparent
    else:
        new_data.append(item)

# Save the processed image with transparent background
image.putdata(new_data)
output_path = "/utils/logo_no_bg.png"
image.save(output_path, "PNG")

# Display the modified image
plt.imshow(image)
plt.axis("off")
plt.show()

output_path
