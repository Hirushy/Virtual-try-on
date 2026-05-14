import os
import cv2
import numpy as np

def debug_fullness():
    print("=== DEBUGGING SILHOUETTE FULLNESS ===")
    
    # Process all masks in output dir
    out_dir = "outputs"
    if not os.path.exists(out_dir):
        print("Outputs dir not found.")
        return
        
    for f in os.listdir(out_dir):
        if not f.endswith("_silhouette.png"):
            continue
            
        mask_path = os.path.join(out_dir, f)
        mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
        
        if mask is None:
            continue
            
        print(f"\n--- {f} ---")
        
        # Exact logic from estimate_body_shape.py
        h, w = mask.shape
        y_indices, x_indices = np.where(mask > 0)
        if len(y_indices) == 0:
            print("Empty mask")
            continue
            
        top_y, bottom_y = np.min(y_indices), np.max(y_indices)
        body_h = bottom_y - top_y
        if body_h <= 0: body_h = 1
        
        def _width_at_row(m, y):
            row = m[y, :]
            idx = np.where(row > 0)[0]
            if len(idx) < 2: return 0
            return idx[-1] - idx[0]
            
        y_sh = int(top_y + body_h * 0.18)
        y_waist = int(top_y + body_h * 0.40)
        y_hip = int(top_y + body_h * 0.55)
        
        sw = _width_at_row(mask, y_sh)
        ww = _width_at_row(mask, y_waist)
        hw = _width_at_row(mask, y_hip)
        
        area = np.sum(mask > 0)
        density = area / (body_h * body_h)
        
        sw_safe = sw if sw > 0 else 1.0
        waist_ratio = ww / sw_safe
        hip_ratio = hw / sw_safe
        
        fullness = (density * 0.6) + (waist_ratio * 0.25) + (hip_ratio * 0.15)
        
        print(f"Shoulder W: {sw}")
        print(f"Waist W:    {ww}")
        print(f"Hip W:      {hw}")
        print(f"Area Density: {density:.4f}")
        print(f"Waist/Shoulder: {waist_ratio:.4f}")
        print(f"Hip/Shoulder:   {hip_ratio:.4f}")
        print(f"--> FULLNESS: {fullness:.4f}")

if __name__ == '__main__':
    debug_fullness()
