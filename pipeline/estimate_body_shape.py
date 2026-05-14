# estimate_body_shape.py

import json
import os
import numpy as np
from PIL import Image

OUTPUT_DIR = "outputs"
PROPORTIONS_PATH = os.path.join(OUTPUT_DIR, "body_proportions.json")
AVATAR_DATA_PATH = os.path.join(OUTPUT_DIR, "avatar_data.json")
PREVIOUS_SHAPE_PATH = os.path.join(OUTPUT_DIR, "previous_shape.json")

SIL_INV_PATH = os.path.join(OUTPUT_DIR, "front_silhouette_inv.png")
SIL_PATH = os.path.join(OUTPUT_DIR, "front_silhouette.png")


# ===============================
# SILHOUETTE LOADING
# ===============================
def _load_silhouette_mask(user_id: str = "guest"):
    sil_inv_path = os.path.join(OUTPUT_DIR, f"{user_id}_front_silhouette_inv.png")
    sil_path = os.path.join(OUTPUT_DIR, f"{user_id}_front_silhouette.png")

    path = sil_inv_path if os.path.exists(sil_inv_path) else sil_path

    if not os.path.exists(path):
        # Fallback to legacy path for backward compatibility
        legacy_path = os.path.join(OUTPUT_DIR, "front_silhouette_inv.png")
        if not os.path.exists(legacy_path):
            legacy_path = os.path.join(OUTPUT_DIR, "front_silhouette.png")
        
        path = legacy_path if os.path.exists(legacy_path) else path

    if not os.path.exists(path):
        return None

    im = Image.open(path).convert("L")
    arr = np.array(im, dtype=np.uint8)

    mask_white = (arr > 127).astype(np.uint8)
    mask_black = (arr < 127).astype(np.uint8)

    mask = mask_white if mask_white.sum() >= mask_black.sum() else mask_black

    if mask.sum() < 150:
        return None

    return mask


def _width_at_row(mask, y):

    xs = np.where(mask[y] > 0)[0]

    if xs.size < 2:
        return 0

    return int(xs.max() - xs.min())


def normalize(val, min_val, max_val):
    if max_val == min_val:
        return 0.5
    res = (val - min_val) / (max_val - min_val)
    return float(np.clip(res, 0.0, 1.0))


def _dir(val, centre, spread):
    """Directional offset from a center point, scaled by spread."""
    return (val - centre) / spread


def final_val(dir_val, base):
    """Final clamped value combining directional offset and base score."""
    v = dir_val + base
    return max(-1.0, min(1.0, v))


def _apply_part(keys_out, prefix, val):
    """Explicitly maps a value to Bigger/Smaller shape keys based on sign."""
    v = float(val)
    if v > 0:
        keys_out[f"{prefix}_Bigger"] = round(v, 4)
        keys_out[f"{prefix}_Smaller"] = 0.0
    elif v < 0:
        keys_out[f"{prefix}_Bigger"] = 0.0
        keys_out[f"{prefix}_Smaller"] = round(abs(v), 4)
    else:
        keys_out[f"{prefix}_Bigger"] = 0.0
        keys_out[f"{prefix}_Smaller"] = 0.0


# ===============================
# BODY SIZE CLASSIFIER ⭐
# ===============================
def compute_fullness_score(front):
    shoulder = float(front.get("shoulder_width", 0))
    waist = float(front.get("waist_width", 0))
    hips = float(front.get("hip_width", 0))
    height = float(front.get("height", 1))

    if height <= 0: return 0.5
    
    # Standard ratios
    wr = waist / height
    hr = hips / height
    sr = shoulder / height
    
    # Combined score (User's Final Viva Logic)
    combined = (wr * 0.50) + (hr * 0.30) + (sr * 0.20)
    
    # Normalize to [0...1] range based on typical silhouette ranges
    # Standardizing for clear S/XL separation
    score = (combined - 0.5) * 2.0 
    return max(0.0, min(1.0, float(score)))

def map_to_size(fullness):
    """
    Converted from the raw Density & Area Ratio logic.
    Average fullness is ~0.53.
    """
    if fullness < 0.35:
        return "S"
    elif fullness < 0.50:
        return "S-M"
    elif fullness < 0.65:
        return "M-L"
    else:
        return "XL"

def run_body_shape(user_id: str = "guest"):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    avatar_data_path = os.path.join(OUTPUT_DIR, f"{user_id}_avatar_data.json")
    
    mask = _load_silhouette_mask(user_id)
    if mask is None:
        print("No silhouette detected.")
        return

    h, w = mask.shape
    ys = np.where(mask.sum(axis=1) > 0)[0]
    if len(ys) < 20: return

    y_top, y_bot = int(ys.min()), int(ys.max())
    body_h = max(1, y_bot - y_top)

    y_sh = y_top + int(body_h * 0.25)
    y_waist = y_top + int(body_h * 0.45)
    y_hip = y_top + int(body_h * 0.60)

    sw = _width_at_row(mask, np.clip(y_sh, 0, h - 1))
    ww = _width_at_row(mask, np.clip(y_waist, 0, h - 1))
    hw = _width_at_row(mask, np.clip(y_hip, 0, h - 1))

    # 🔥 NORMALIZATION (USER REQUESTED ARCHITECTURE)
    def normalize(x, min_v, max_v):
        return max(0, min(1, (x - min_v) / (max_v - min_v)))

    # Values calibrated for silhouette density and pixel-width ratios
    chest_n = normalize(sw / body_h,  0.20, 0.30)
    waist_n = normalize(ww / body_h,  0.18, 0.28)
    hips_n  = normalize(hw / body_h,  0.20, 0.30)
    
    fullness = (chest_n + waist_n + hips_n) / 3.0
    fullness = float(np.clip(fullness, 0.0, 1.0))

    # Print the EXACT debug block requested by user
    print(f"Chest: {chest_n:.4f}")
    print(f"Waist: {waist_n:.4f}")
    print(f"Hips: {hips_n:.4f}")
    print(f"Fullness: {fullness:.4f}")
    print(f"Mapped size: {map_to_size(fullness)}")
    
    # Calculate final measurements
    chest_cm = (sw / body_h) * 170.0 * 1.5
    waist_cm = (ww / body_h) * 170.0 * 1.5
    hips_cm = (hw / body_h) * 170.0 * 1.5
    shoulders_cm = (sw / body_h) * 170.0 * 1.3
    
    size = map_to_size(fullness)
    
    # Categorical label (Source of Truth)
    labels = { "S": "Slim", "S-M": "Balanced", "M-L": "Broad", "XL": "Heavy" }
    body_size = labels.get(size, "Balanced")

    output = {
        "gender": "female",
        "body_size": body_size,
        "size": size,
        "fullness_score": float(fullness),
        "proportions": {
            "shoulder_ratio": float(round(sw / body_h, 4)),
            "waist_ratio": float(round(ww / body_h, 4)),
            "hip_ratio": float(round(hw / body_h, 4)),
            "height": float(body_h)
        },
        "metrics": {
            "chest": round(chest_cm, 1),
            "waist": round(waist_cm, 1),
            "hips": round(hips_cm, 1),
            "shoulders": round(shoulders_cm, 1),
            "neck": 38.0,
            "height": 170.0
        }
    }

    print("======== VIVA DIAGNOSTICS ========")
    print(f"CHEST CM: {chest_cm:.1f}")
    print(f"WAIST CM: {waist_cm:.1f}")
    print(f"HIPS CM:  {hips_cm:.1f}")
    print(f"FINAL SIZE → {size}")
    print("==================================")

    with open(avatar_data_path, "w") as f:
        json.dump(output, f, indent=4)


if __name__ == "__main__":
    run_body_shape()