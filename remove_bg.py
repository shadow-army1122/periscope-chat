from PIL import Image

def remove_white_bg(input_path, output_path, tolerance=240):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()

    new_data = []
    for item in data:
        # If pixel is near white (R, G, B > tolerance)
        if item[0] > tolerance and item[1] > tolerance and item[2] > tolerance:
            new_data.append((255, 255, 255, 0)) # Transparent
        else:
            new_data.append(item)

    img.putdata(new_data)
    
    # Crop to content
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(output_path, "PNG")
    print("Background removed and saved to", output_path)

input_file = r"C:\Users\vivek\.gemini\antigravity-ide\brain\8d1a091e-234f-4f60-8ef9-500f04c66dad\periscope_robot_no_text_1780571125461.png"
output_file = r"c:\Users\vivek\Documents\Era Projects\1\periscope.developerlab.tech\public\logo.png"

remove_white_bg(input_file, output_file)
