import os
import cv2
import numpy as np
import pandas as pd
import pickle
from tqdm import tqdm

# ✅ Reuse the same MediaPipe logic from detect_body.py
from mp_compat import mp
from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision as mp_vision

MODEL_PATH = os.path.join("models", "pose_landmarker_full.task")
TRAIN_ROOT = "photos_for_training"
OUTPUT_CSV = "photo_training_data.csv"

# Mapping folders to labels
# slim_female -> size: S, gender: F
# average_female -> size: S-M, gender: F
# chubby_female -> size: M-L, gender: F
# fat_female -> size: XL, gender: F
# (and same for _male)

SIZE_MAP = {
    "slim": "S",
    "average": "S-M",
    "chubby": "M-L",
    "fat": "XL"
}

def create_landmarker():
    if not os.path.exists(MODEL_PATH):
        print(f"❌ Error: Model not found at {MODEL_PATH}")
        return None
    base_options = mp_tasks.BaseOptions(model_asset_path=MODEL_PATH)
    options = mp_vision.PoseLandmarkerOptions(
        base_options=base_options,
        running_mode=mp_vision.RunningMode.IMAGE,
        num_poses=1
    )
    return mp_vision.PoseLandmarker.create_from_options(options)

def get_body_weights(image_path, landmarker):
    img = cv2.imread(image_path)
    if img is None: return None
    
    h, w, _ = img.shape
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    result = landmarker.detect(mp_image)
    
    if not result.pose_landmarks:
        return None
        
    landmarks = result.pose_landmarks[0]
    
    # MediaPipe pose landmarks:
    # 11: left_shoulder, 12: right_shoulder
    # 23: left_hip, 24: right_hip
    
    ls = landmarks[11]
    rs = landmarks[12]
    lh = landmarks[23]
    rh = landmarks[24]
    
    ls = landmarks[11]
    rs = landmarks[12]
    lh = landmarks[23]
    rh = landmarks[24]
    la = landmarks[27]
    ra = landmarks[28]

    # 1. Raw Widths
    chest_w = abs(ls.x - rs.x)
    hips_w = abs(lh.x - rh.x)
    
    # Waist (midpoint line between shoulders & hips)
    left_waist_x = (ls.x + lh.x) / 2
    right_waist_x = (rs.x + rh.x) / 2
    waist_w = abs(left_waist_x - right_waist_x)
    
    # 2. Body Height (Shoulders to Ankles)
    sh_y = (ls.y + rs.y) / 2
    ank_y = (la.y + ra.y) / 2
    body_h = abs(ank_y - sh_y)
    if body_h <= 0: body_h = 1.0
    
    # 3. Standard Ratios (Width / Height)
    # 🎯 ALIGNED WITH USER DATA: Slim ~0.35, Fat ~0.65
    c_r = chest_w / body_h
    w_r = waist_w / body_h
    h_r = hips_w / body_h
    
    # 🔥 v3.4 CALIBRATION BOOST: Multiply by 2.0 to match User's Manual Range
    # (Converts Full-Body ratios to the shorter-torso range expected by ML)
    c_final = c_r * 2.0
    w_final = w_r * 2.0
    h_final = h_r * 2.0
    
    # 🎯 5. ADVANCED RATIOS
    c_w_ratio = c_final / (w_final if w_final > 0 else 0.1)
    w_h_ratio = w_final / (h_final if h_final > 0 else 0.1)
    
    # 🎯 6. SAFETY CLAMP (Protect AI against crazy outliers)
    c_final = max(0.1, min(c_final, 1.0))
    w_final = max(0.1, min(w_final, 1.0))
    h_final = max(0.1, min(h_final, 1.0))
    
    return [
        round(c_final, 4), 
        round(w_final, 4), 
        round(h_final, 4),
        round(c_w_ratio, 4),
        round(w_h_ratio, 4)
    ]

def run_training_pipeline():
    print("🚀 Starting ML Size Training Pipeline...")
    landmarker = create_landmarker()
    if not landmarker: return
    
    all_data = []
    
    if not os.path.exists(TRAIN_ROOT):
        print(f"❌ Error: {TRAIN_ROOT} folder not found.")
        return

    # Walk through folders
    for folder in os.listdir(TRAIN_ROOT):
        folder_path = os.path.join(TRAIN_ROOT, folder)
        if not os.path.isdir(folder_path): continue
        
        # Parse folder name (e.g. slim_female)
        parts = folder.split('_')
        if len(parts) < 2:
            print(f"⚠️ Skipping folder with invalid format: {folder}")
            continue
            
        raw_size = parts[0]
        raw_gender = parts[1]
        
        size_label = SIZE_MAP.get(raw_size.lower())
        gender_label = "F" if "female" in raw_gender.lower() else "M"
        
        if not size_label:
            print(f"⚠️ Skipping folder with unknown size: {folder}")
            continue

        print(f"📂 Processing {folder}...")
        for file in tqdm(os.listdir(folder_path)):
            if not file.lower().endswith(('.png', '.jpg', '.jpeg')): continue
            
            img_path = os.path.join(folder_path, file)
            features = get_body_weights(img_path, landmarker)
            
            if features:
                all_data.append({
                    "photo_name": file,
                    "features": features,
                    "size": size_label,
                    "gender": gender_label
                })

    if not all_data:
        print("❌ No data collected. Check your photos and MediaPipe model.")
        return

    # Save to CSV
    df = pd.DataFrame(all_data)
    df.to_csv(OUTPUT_CSV, index=False)
    print(f"✅ Saved training data to {OUTPUT_CSV}")

    # Train Models
    from sklearn.ensemble import RandomForestClassifier
    
    # --- FEMALE MODEL ---
    df_f = df[df['gender'] == 'F']
    if not df_f.empty:
        # Features: [chest, waist, hips, c/w, w/h]
        X_f = np.stack(df_f['features'].values)
        y_f = df_f['size'].values
        clf_f = RandomForestClassifier(n_estimators=100)
        clf_f.fit(X_f, y_f)
        with open("photo_size_model_female.pkl", "wb") as f:
            pickle.dump(clf_f, f)
        print("✅ Trained and saved photo_size_model_female.pkl")
    else:
        print("⚠️ No female data found to train.")

    # --- MALE MODEL ---
    df_m = df[df['gender'] == 'M']
    if not df_m.empty:
        X_m = np.stack(df_m['features'].values)
        y_m = df_m['size'].values
        clf_m = RandomForestClassifier(n_estimators=100)
        clf_m.fit(X_m, y_m)
        with open("photo_size_model_male.pkl", "wb") as f:
            pickle.dump(clf_m, f)
        print("✅ Trained and saved photo_size_model_male.pkl")
    else:
        print("⚠️ No male data found to train.")

    print("\n🎉 ALL DONE! You can now use these .pkl files in your backend.")

if __name__ == "__main__":
    run_training_pipeline()
