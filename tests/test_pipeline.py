import os
import shutil
import json

from detect_body import run_pose_detection
from estimate_body_safe import run_safe_estimation
from estimate_body_shape import run_body_shape
from build_avatar_data import build_avatar_data

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"

def test_image(img_name):
    print(f"\n--- Testing {img_name} ---")
    front_src = os.path.join(UPLOAD_DIR, img_name)
    front_dst = os.path.join(UPLOAD_DIR, "front.jpg")
    
    if os.path.exists(front_src):
        # copy to front.jpg
        shutil.copyfile(front_src, front_dst)
        
        try:
            run_pose_detection()
            run_safe_estimation()
            run_body_shape()
            build_avatar_data()
            
            with open(os.path.join(OUTPUT_DIR, "avatar_data.json"), "r") as f:
                data = json.load(f)
                weights = data.get("shape_key_weights", {})
                
                # Extract one morphed key just to verify
                waist_bigger = weights.get("Female_Waist_Bigger", 0)
                waist_smaller = weights.get("Female_Waist_Smaller", 0)
                
                print(f"Result for {img_name}:")
                print(f"  Gender: {data.get('gender')}")
                if waist_bigger > 0:
                    print(f"  Status: FAT (Waist Bigger: {waist_bigger:.2f})")
                elif waist_smaller > 0:
                    print(f"  Status: SLIM (Waist Smaller: {waist_smaller:.2f})")
                else:
                    print(f"  Status: AVERAGE (No waist morphs)")
                    
        except Exception as e:
            print(f"Failed pipeline: {e}")
    else:
        print(f"{img_name} not found")

if __name__ == "__main__":
    for f in os.listdir(UPLOAD_DIR):
        if f.endswith(".jpg") and f != "front.jpg" and f != "side.jpg":
            test_image(f)
    print("Done")
