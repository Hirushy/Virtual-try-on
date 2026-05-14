import os
import cv2
import json
from estimate_body_shape import _extract_body_proportions
from build_avatar_data import _combined_score

print("=== DEBUGGING USER UPLOADED IMAGES ===")
for f in os.listdir("uploads"):
    if not f.lower().endswith(('.png', '.jpg', '.jpeg')):
        continue
    
    img_path = os.path.join("uploads", f)
    img = cv2.imread(img_path)
    if img is None:
        continue
        
    props = _extract_body_proportions(img)
    if not props or "front" not in props:
        continue
        
    front = props["front"]
    waist = front.get("waist_width", 0)
    hips = front.get("hip_width", 0)
    shoulder = front.get("shoulder_width", 0)
    height = front.get("height", 1)
    
    score = _combined_score(front)
    
    print(f"\nImage: {f}")
    print(f"Waist: {waist/height:.4f}  Hips: {hips/height:.4f}  Shoulder: {shoulder/height:.4f}")
    print(f"COMBINED SCORE: {score:.5f}")
    
    if score <= 0.235:
        print("  -> Currently mapping to: S")
    elif score <= 0.255:
        print("  -> Currently mapping to: S-M")
    elif score <= 0.270:
        print("  -> Currently mapping to: M-L")
    else:
        print("  -> Currently mapping to: XL")
