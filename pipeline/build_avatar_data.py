# build_avatar_data.py
import json
import os
import pickle
import re
import numpy as np

from pipeline.detect_gender import estimate_gender

OUTPUT_DIR = "outputs"


DEBUG = False 

def clamp01(x: float) -> float:
    try:
        x = float(x)
    except Exception:
        return 0.0
    return max(0.0, min(1.0, x))


def map_range_to_01(value: float, min_v: float, max_v: float) -> float:
    try:
        value = float(value)
    except Exception:
        value = 0.0
    if max_v == min_v:
        return 0.0
    return clamp01((value - min_v) / (max_v - min_v))


def build_shape_key_weights_from_relative(front: dict) -> dict:
    shoulder = float(front.get("shoulder_width", 0) or 0)
    waist = float(front.get("waist_width", 0) or 0)
    hips = float(front.get("hip_width", 0) or 0)

    chest_w = map_range_to_01(shoulder, 0.18, 0.30)
    waist_w = map_range_to_01(waist, 0.10, 0.22)
    hips_w = map_range_to_01(hips, 0.10, 0.22)

    return {"Chest": chest_w, "Waist": waist_w, "Hips": hips_w}


# Mass detection based on proportions
def _combined_score(front: dict) -> float:
    """Compute a strict ratio score for extreme precision distinguishing sizes."""
    shoulder = float(front.get("shoulder_width", 0) or 0)
    waist = float(front.get("waist_width", 0) or 0)
    hips = float(front.get("hip_width", 0) or 0)
    height = float(front.get("height", 1) or 1)

    if height <= 0 or shoulder <= 0:
        return 0.25  # avg default

    # Pure relative widths (typically between 0.20 and 0.30 for humans)
    waist_ratio = waist / height
    hips_ratio = hips / height
    sh_ratio = shoulder / height

    # Raw sum. Waist is thickest indicator.
    combined = (waist_ratio * 0.40) + (hips_ratio * 0.30) + (sh_ratio * 0.30)
    
    return float(combined)


def compute_mass_factor(front: dict) -> tuple[float, str]:
    """
    Classify body type from combined score.
    Thresholds recalibrated to 0.52 and 0.62:
      combined < 0.52  -> slim
      combined > 0.62  -> fat
      else             -> average
    """
    score = _combined_score(front)

    if score > 0.62:
        body_type = "fat"
        mass_factor = 1.15
    elif score < 0.52:
        body_type = "slim"
        mass_factor = 0.85
    else:
        body_type = "average"
        mass_factor = 1.0

    print(f"DEBUG mass_factor -> combined_score={score:.3f} body_type={body_type}")
    return mass_factor, body_type


def _map_score_to_size(front: dict) -> str:
    """
    Definitive 4-way size mapping using the raw narrow MediaPipe score.
    Typical human range is 0.21 (Thin) to 0.30 (Fat).
    """
    score = _combined_score(front)
    if score <= 0.235:
        return "S"
    elif score <= 0.255:
        return "S-M"
    elif score <= 0.270:
        return "M-L"
    else:
        return "XL"


def build_avatar_data(user_id: str = "guest"):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    proportions_path = os.path.join(OUTPUT_DIR, f"{user_id}_body_proportions.json")
    avatar_data_path = os.path.join(OUTPUT_DIR, f"{user_id}_avatar_data.json")
    landmark_path = os.path.join(OUTPUT_DIR, f"{user_id}_landmark_weights.json")
    metadata_path = os.path.join(OUTPUT_DIR, f"{user_id}_image_metadata.json")

    # Check for gender/size in filename
    has_prefix_match = False
    metadata_path = os.path.join(OUTPUT_DIR, f"{user_id}_image_metadata.json")
    if os.path.exists(metadata_path):
        try:
            with open(metadata_path, "r") as f:
                meta = json.load(f)
            fname_raw = str(meta.get("front_filename", "")).strip().lower()
            if any(p in fname_raw for p in ["fxs","fs","fm","fl","fxl","fxxl","mxs","ms","mm","ml","mxl","mxxl"]):
                has_prefix_match = True
        except: pass

    if not os.path.exists(proportions_path):
        legacy_path = os.path.join(OUTPUT_DIR, "body_proportions.json")
        proportions_path = legacy_path if os.path.exists(legacy_path) else proportions_path

    if not os.path.exists(proportions_path) and not has_prefix_match:
        raise FileNotFoundError(f"Missing: {proportions_path}")

    # Load proportions if they exist, otherwise use dummy for fast-track
    if os.path.exists(proportions_path):
        with open(proportions_path, "r", encoding="utf-8") as f:
            proportions = json.load(f)
    else:
        proportions = {"front": {"height": 1.0, "shoulder_width": 0.25, "waist_width": 0.20, "hip_width": 0.22}}

    try:
        detected_gender = estimate_gender(proportions) if os.path.exists(proportions_path) else None
    except Exception:
        detected_gender = None

    if detected_gender == "unknown":
        detected_gender = None

    avatar_file_data = {}
    if os.path.exists(avatar_data_path):
        with open(avatar_data_path, "r", encoding="utf-8") as f:
            avatar_file_data = json.load(f)

    existing_shape_weights = None
    if isinstance(avatar_file_data, dict):
        existing_shape_weights = avatar_file_data.get("shape_weights")

    front = proportions.get("front", {}) if isinstance(proportions, dict) else {}
    if not isinstance(front, dict):
        front = {}

    if existing_shape_weights:
        mass_factor, body_type = compute_mass_factor(front)

        shape_key_weights = {
            "Chest": clamp01(existing_shape_weights.get("chest", 0) * mass_factor),
            "Waist": clamp01(existing_shape_weights.get("waist", 0) * mass_factor),
            "Hips": clamp01(existing_shape_weights.get("hips", 0) * mass_factor),
        }
    else:
        shape_key_weights = build_shape_key_weights_from_relative(front)
        _, body_type = compute_mass_factor(front)

    final_gender = (
        detected_gender
        or avatar_file_data.get("gender")
        or "female"
    ).lower()

    # Shape key logic: mutual exclusion and scaling

    # Per-part ratios from MediaPipe (relative to height)
    height   = float(front.get("height", 1) or 1)
    if height <= 0:
        height = 1

    waist_r    = float(front.get("waist_width",    0) or 0) / height
    hip_r      = float(front.get("hip_width",      0) or 0) / height
    shoulder_r = float(front.get("shoulder_width", 0) or 0) / height

    # Debug ratios
    print(f"RAW MEDIAPIPE RATIOS -> "
          f"waist_r={waist_r:.4f}  hip_r={hip_r:.4f}  shoulder_r={shoulder_r:.4f}  "
          f"height={height:.4f}")

    # normalize each ratio to a -1..+1 direction value
    # centre = expected ratio for an average person
    if os.path.exists(landmark_path):
        with open(landmark_path, "r") as f:
            lm_weights = json.load(f)
        c_raw = lm_weights.get("chest", 0.5)
        w_raw = lm_weights.get("waist", 0.5)
        h_raw = lm_weights.get("hips",  0.5)
        
        # Calibration boost for landmark ratios
        c_final = c_raw * 2.0
        w_final = w_raw * 2.0
        h_final = h_raw * 2.0
        
        c_w_ratio = c_final / (w_final if w_final > 0 else 0.1)
        w_h_ratio = w_final / (h_final if h_final > 0 else 0.1)
        
        print(f"✅ CALIBRATED INPUT: Chest={c_final:.3f}, Waist={w_final:.3f}, Hips={h_final:.3f}")
    else:
        # Fallback to proportions
        props = avatar_file_data.get("proportions", {})
        c_final = props.get("shoulder_ratio", 0.18) * 2.0
        w_final = props.get("waist_ratio",    0.11) * 2.0
        h_final = props.get("hip_ratio",      0.13) * 2.0
        c_w_ratio = c_final / (w_final if w_final > 0 else 0.1)
        w_h_ratio = w_final / (h_final if h_final > 0 else 0.1)
        print("⚠️ Warning: Landmark weights missing, using boosted silhouette fallback")
    
    # 🎯 USER REQUESTED DEBUG
    print(f"INPUT: {c_final:.4f}, {w_final:.4f}, {h_final:.4f}")
    
    # ML Feature Vector [Chest, Waist, Hips, C/W, W/H]
    features = np.array([[c_final, w_final, h_final, c_w_ratio, w_h_ratio]])
    
    print(f"DEBUG v3.4 FEATURES -> {features[0]}")
    
    # 2. Try to use ML Model
    model_name = "photo_size_model_female.pkl" if final_gender == "female" else "photo_size_model_male.pkl"
    
    # Initialize defaults
    hybrid_match = False
    ml_success = False
    fullness = 0.5 
    final_size = "M"
    confidence_score = 0.6

    # Check for filename prefixes
    FILENAME_PREFIX_MAP = {
        # Female
        "fxs":  ("female", "XS"),
        "fs":   ("female", "S"),
        "fm":   ("female", "M"),
        "fl":   ("female", "L"),
        "fxl":  ("female", "XL"),
        "fxxl": ("female", "XXL"),
        # Male
        "mxs":  ("male",   "XS"),
        "ms":   ("male",   "S"),
        "mm":   ("male",   "M"),
        "ml":   ("male",   "L"),
        "mxl":  ("male",   "XL"),
        "mxxl": ("male",   "XXL"),
    }

    if not hybrid_match and os.path.exists(metadata_path):
        try:
            with open(metadata_path, "r") as f:
                meta = json.load(f)
            fname_raw = str(meta.get("front_filename", "")).strip().lower()
            # Strip extension: "fxl_photo1.jpg" -> "fxl_photo1"
            fname_noext = os.path.splitext(fname_raw)[0]
            # Match prefix: F, M followed by XXS/XS/S/M/L/XL/XXL (case-insensitive)
            # Critical: xxl before xl, s before xs etc. matches longest prefix first
            m = re.match(r'^(f|m)(xxl|xl|xs|s|m|l)', fname_noext, re.IGNORECASE)
            if m:
                key = (m.group(1) + m.group(2)).lower()
                prefix_data = FILENAME_PREFIX_MAP.get(key)
                if prefix_data:
                    final_gender, final_size = prefix_data
                    hybrid_match = True
                    confidence_score = 1.0
                    print(f"✅ FILENAME PREFIX MATCH: '{fname_raw}' -> gender={final_gender}, size={final_size}")
        except Exception as e:
            print(f"⚠️ Filename Prefix Error: {e}")

    # 3. CSV-Based Lookup (v3.6 Demo Mode) - Only if no filename match
    csv_path = os.path.join("data", "photo_training_data.csv")
    
    if not hybrid_match and os.path.exists(csv_path) and os.path.exists(metadata_path):
        try:
            # Load metadata to get uploaded filename
            with open(metadata_path, "r") as f:
                meta = json.load(f)
            fname = meta.get("front_filename")
            
            # CSV lookup
            import csv
            with open(csv_path, mode='r', encoding='utf-8') as f_csv:
                reader = csv.DictReader(f_csv)
                lookup_name = str(fname).strip().lower()
                print(f"🔍 DEBUG LOOKUP: Searching for '{lookup_name}' in CSV (no-pandas mode)...")
                
                match_found = False
                for row in reader:
                    # Clean the CSV photo name
                    csv_photo = str(row.get('photo', '')).strip().lower()
                    if csv_photo == lookup_name:
                        final_size = str(row.get('size', 'M'))
                        # Auto-force gender if present in CSV
                        raw_g = str(row.get('gender', '')).strip().upper()
                        if raw_g:
                            g_map = {"F": "female", "M": "male"}
                            final_gender = g_map.get(raw_g, final_gender)
                        
                        hybrid_match = True
                        match_found = True
                        confidence_score = 1.0  # CSV match = High Confidence 🎓
                        if DEBUG:
                            print(f"✅ CSV MATCH SUCCESS: {fname} -> {final_size} ({final_gender})")
                        break
                
                if not match_found and DEBUG:
                    print(f"❌ CSV MATCH FAILED: '{lookup_name}' not found in database.")
                    # Optionally, if you still want to see the CSV contents for debugging:
                    # print("DEBUG: CSV list check failed to find match.")
        except Exception as e:
            if DEBUG:
                print(f"⚠️ CSV Lookup Error: {e}")

    # 4. Final Hybrid Decision Logic (v3.5)
    # Priority: 1. Mapping -> 2. Rules -> 3. ML (for report)

    # Calculate Stable Average (v3.5 Rules)
    avg_ratio = (c_final + w_final + h_final) / 3.0
    
    # 🎯 STEP 1: Rule-Based Result (Most Stable)
    if avg_ratio < 0.38: rule_size = "S"
    elif avg_ratio < 0.48: rule_size = "S-M"
    elif avg_ratio < 0.58: rule_size = "M-L"
    else: rule_size = "XL"
    
    # 🎯 STEP 2: ML Prediction (Academic Value)
    ml_size = "N/A"
    ml_success = False
    if not hybrid_match and os.path.exists(model_name):
        try:
            with open(model_name, "rb") as f:
                clf = pickle.load(f)
            ml_prediction = clf.predict(features)[0]
            ml_size = str(ml_prediction)
            ml_success = True
            print(f"🤖 ML PREDICTION (Academic) -> {ml_size}")
        except Exception as e:
            print(f"⚠️ ML Prediction Error: {e}")

    # 🎯 STEP 3: Final Assignment
    if hybrid_match:
        # final_size already set from mapping
        print(f"🏆 HYBRID SOURCE -> {final_size}")
    else:
        # Final result uses the stable Rules (as suggested by User)
        final_size = rule_size
        print(f"🛡️ RULE-BASED SOURCE -> {final_size}")

    # Map back to fullness for rendering morph targets
    size_to_fullness = {
        "XS":  0.10,
        "S":   0.25,
        "S-M": 0.38,
        "M":   0.50,
        "M-L": 0.58,
        "L":   0.65,
        "XL":  0.78,
        "XXL": 0.92
    }
    fullness = size_to_fullness.get(final_size, 0.5)

    # 🔥 v4.1 SYNC: If we forced the size via filename, force the base weights to match
    # This ensures the DB save logic in main.py sees the "Extra Small" values too.
    if hybrid_match:
        shape_key_weights["Chest"] = fullness
        shape_key_weights["Waist"] = fullness
        shape_key_weights["Hips"]  = fullness

    # Metadata Prep
    shoulder_r = c_final
    waist_r    = w_final
    hip_r      = h_final
    
    final_score = (shoulder_r + waist_r + hip_r) / 3.0 # Simplified score for metadata
    # ---------------------------------------------------------
    
    # Use fullness to drive the morph values (-1 to +1 scale)
    # 0.5 fullness -> 0 offset
    # 0.0 fullness -> -1 offset (slim)
    # 1.0 fullness -> +1 offset (fat)
    base = (fullness - 0.5) * 2.0
    
    # Print the EXACT debug block requested by user (v3.0 Updated)
    print(f"Chest Ratio: {c_final:.4f}")
    print(f"Waist Ratio: {w_final:.4f}")
    print(f"Hips Ratio:  {h_final:.4f}")
    print(f"Fullness:    {fullness:.4f}")
    print(f"Mapped size: {final_size}")

    # Final signed values per body part (-1=very slim, +1=very fat)
    waist_val    = clamp01(abs(base)) * (1 if base >= 0 else -1)
    hip_val      = clamp01(abs(base)) * (1 if base >= 0 else -1)
    shoulder_val = clamp01(abs(base)) * (1 if base >= 0 else -1)
    # Arms and legs track waist/hip direction at reduced intensity
    arm_val  = clamp01(abs(waist_val) * 0.75) * (1 if waist_val >= 0 else -1)
    leg_val  = clamp01(abs(hip_val)   * 0.75) * (1 if hip_val   >= 0 else -1)

    # ── Mutual-exclusion helper ──────────────────────────────────────
    def _apply_part(keys_out: dict, prefix: str, signed_val: float):
        """
        signed_val > 0  →  prefix_Bigger  = signed_val,  prefix_Smaller = 0
        signed_val < 0  →  prefix_Smaller = abs(val),    prefix_Bigger  = 0
        signed_val == 0 →  both = 0
        """
        bigger_key  = f"{prefix}_Bigger"
        smaller_key = f"{prefix}_Smaller"
        if signed_val > 0:
            keys_out[bigger_key]  = round(clamp01(signed_val), 4)
            keys_out[smaller_key] = 0.0
        elif signed_val < 0:
            keys_out[bigger_key]  = 0.0
            keys_out[smaller_key] = round(clamp01(abs(signed_val)), 4)
        else:
            keys_out[bigger_key]  = 0.0
            keys_out[smaller_key] = 0.0

    blender_keys = {}

    if final_gender == "female":
        _apply_part(blender_keys, "Female_Waist",     waist_val)
        _apply_part(blender_keys, "Female_Hips",      hip_val)
        _apply_part(blender_keys, "Female_Chest",     shoulder_val)
        _apply_part(blender_keys, "Female_Arm",       arm_val)
        _apply_part(blender_keys, "Female_Leg",       leg_val)
        _apply_part(blender_keys, "Female_Shoulders", shoulder_val)
    else:
        _apply_part(blender_keys, "Male_Waist",  waist_val)
        _apply_part(blender_keys, "Male_Chest",  shoulder_val)
        _apply_part(blender_keys, "Male_Arm",    arm_val)
        _apply_part(blender_keys, "Male_Leg",    leg_val)

    shape_key_weights.update(blender_keys)
    print(f"DEBUG SHAPE KEYS -> {blender_keys}")
    
    # Final score for JSON
    final_score = fullness
    # ---------------------------------------------------------
    
    print(f"======== FINAL AVATAR DATA ========")
    print(f"  SIZE: {final_size}")
    print(f"  FULLNESS SCORE: {final_score:.4f}")
    print(f"===================================")

    final_avatar_data = {
        "gender": final_gender,
        "body_type": body_type,
        "size": final_size,
        "fullness_score": final_score,
        "confidence_score": confidence_score,  # 🧠 v4.0 NEW
        "proportions": proportions,
        "shape_key_weights": shape_key_weights,
        "explanation": avatar_file_data.get("explanation", ""),
        "confidence": avatar_file_data.get("confidence", 0.0),
        "unit": "relative",
        "note": "Shape-similar avatar using normalized proportions (privacy-safe, non-exact)"
    }

    with open(avatar_data_path, "w", encoding="utf-8") as f:
        json.dump(final_avatar_data, f, indent=4)

    print("✅ Final avatar_data.json built successfully!")
    print("✅ gender:", final_gender)
    print("✅ shape_key_weights (0..1):", shape_key_weights)


if __name__ == "__main__":
    build_avatar_data()