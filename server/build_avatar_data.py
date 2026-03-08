# build_avatar_data.py
import json
import os

from detect_gender import estimate_gender

OUTPUT_DIR = "outputs"
PROPORTIONS_PATH = os.path.join(OUTPUT_DIR, "body_proportions.json")
AVATAR_DATA_PATH = os.path.join(OUTPUT_DIR, "avatar_data.json")


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


# 🔥 NEW: Mass Detection
def compute_mass_factor(front: dict) -> float:
    shoulder = float(front.get("shoulder_width", 0) or 0)
    waist = float(front.get("waist_width", 0) or 0)
    hips = float(front.get("hip_width", 0) or 0)
    height = float(front.get("height", 1) or 1)

    if height <= 0:
        return 1.0

    fullness = (shoulder + waist + hips) / height

    # Adjustable thresholds
    if fullness < 0.45:
        return 0.85   # thin
    elif fullness < 0.60:
        return 1.0    # average
    else:
        return 1.15   # fuller


def build_avatar_data():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    if not os.path.exists(PROPORTIONS_PATH):
        raise FileNotFoundError(f"Missing: {PROPORTIONS_PATH}")

    if not os.path.exists(AVATAR_DATA_PATH):
        raise FileNotFoundError(f"Missing: {AVATAR_DATA_PATH}")

    with open(PROPORTIONS_PATH, "r", encoding="utf-8") as f:
        proportions = json.load(f)

    try:
        detected_gender = estimate_gender(proportions)
    except Exception:
        detected_gender = None

    if detected_gender == "unknown":
        detected_gender = None

    with open(AVATAR_DATA_PATH, "r", encoding="utf-8") as f:
        avatar_file_data = json.load(f)

    existing_shape_weights = None
    if isinstance(avatar_file_data, dict):
        existing_shape_weights = avatar_file_data.get("shape_weights")

    front = proportions.get("front", {}) if isinstance(proportions, dict) else {}
    if not isinstance(front, dict):
        front = {}

    if existing_shape_weights:
        # 🔥 Apply mass factor scaling
        mass_factor = compute_mass_factor(front)

        shape_key_weights = {
            "Chest": clamp01(existing_shape_weights.get("chest", 0) * mass_factor),
            "Waist": clamp01(existing_shape_weights.get("waist", 0) * mass_factor),
            "Hips": clamp01(existing_shape_weights.get("hips", 0) * mass_factor),
        }
    else:
        shape_key_weights = build_shape_key_weights_from_relative(front)

    final_gender = (
        detected_gender
        or avatar_file_data.get("gender")
        or "female"
    )

    final_avatar_data = {
        "gender": final_gender,
        "proportions": proportions,
        "shape_key_weights": shape_key_weights,
        "unit": "relative",
        "note": "Shape-similar avatar using normalized proportions (privacy-safe, non-exact)"
    }

    with open(AVATAR_DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(final_avatar_data, f, indent=4)

    print("✅ Final avatar_data.json built successfully!")
    print("✅ gender:", final_gender)
    print("✅ shape_key_weights (0..1):", shape_key_weights)


if __name__ == "__main__":
    build_avatar_data()