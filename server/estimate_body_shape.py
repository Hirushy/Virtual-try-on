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
def _load_silhouette_mask():

    path = SIL_INV_PATH if os.path.exists(SIL_INV_PATH) else SIL_PATH

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


# ===============================
# BODY MASS FULLNESS SCORE ⭐
# ===============================
def compute_fullness_score(front):

    shoulder = float(front.get("shoulder_width", 0))
    waist = float(front.get("waist_width", 0))
    hips = float(front.get("hip_width", 0))
    height = float(front.get("height", 1))

    if height <= 0:
        return 0.6

    fullness = (shoulder + waist + hips) / height

    return fullness


# ===============================
# BODY SIZE CLASSIFIER ⭐
# ===============================
def classify_body_size(fullness):

    # Adaptive separation thresholds
    if fullness < 0.65:
        return "Thin"

    if fullness > 0.72:
        return "Heavy"

    return "Average"


# ===============================
# SHAPE WEIGHT GENERATOR
# ===============================
def generate_shape_weights(body_size):

    rng = np.random.default_rng()

    if body_size == "Thin":
        return {
            "chest": float(np.clip(0.32 + rng.uniform(-0.02, 0.02), 0.28, 0.38)),
            "waist": float(np.clip(0.55 + rng.uniform(-0.03, 0.03), 0.45, 0.70)),
            "hips": float(np.clip(0.25 + rng.uniform(-0.02, 0.02), 0.20, 0.35))
        }

    if body_size == "Heavy":
        return {
            "chest": float(np.clip(0.48 + rng.uniform(-0.03, 0.03), 0.42, 0.60)),
            "waist": float(np.clip(0.78 + rng.uniform(-0.04, 0.04), 0.70, 0.90)),
            "hips": float(np.clip(0.40 + rng.uniform(-0.03, 0.03), 0.32, 0.50))
        }

    # Average
    return {
        "chest": 0.40,
        "waist": 0.60,
        "hips": 0.30
    }


# ===============================
# MAIN PIPELINE
# ===============================
def run_body_shape():

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    mask = _load_silhouette_mask()

    if mask is None:
        print("No silhouette detected.")
        return

    h, w = mask.shape

    ys = np.where(mask.sum(axis=1) > 0)[0]

    if len(ys) < 20:
        print("Silhouette too small.")
        return

    y_top = int(ys.min())
    y_bot = int(ys.max())

    body_h = max(1, y_bot - y_top)

    y_sh = y_top + int(body_h * 0.25)
    y_waist = y_top + int(body_h * 0.45)
    y_hip = y_top + int(body_h * 0.60)

    sw = _width_at_row(mask, np.clip(y_sh, 0, h - 1))
    ww = _width_at_row(mask, np.clip(y_waist, 0, h - 1))
    hw = _width_at_row(mask, np.clip(y_hip, 0, h - 1))

    front_proportions = {
        "shoulder_width": sw / max(body_h, 1),
        "waist_width": ww / max(body_h, 1),
        "hip_width": hw / max(body_h, 1),
        "height": 1.0
    }

    # Save proportions
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with open(PROPORTIONS_PATH, "w") as f:
        json.dump({"front": front_proportions}, f, indent=4)

    fullness = compute_fullness_score(front_proportions)

    body_size = classify_body_size(fullness)

    shape_weights = generate_shape_weights(body_size)

    # Temporal smoothing
    previous_shape = None

    if os.path.exists(PREVIOUS_SHAPE_PATH):
        try:
            with open(PREVIOUS_SHAPE_PATH, "r") as f:
                previous_shape = json.load(f)
        except:
            previous_shape = None

    if previous_shape is not None:
        for k in shape_weights:
            shape_weights[k] = float(
                shape_weights[k] * 0.8 +
                previous_shape.get(k, shape_weights[k]) * 0.2
            )

    with open(PREVIOUS_SHAPE_PATH, "w") as f:
        json.dump(shape_weights, f, indent=4)

    output = {
        "gender": "female",
        "body_size": body_size,
        "fullness_score": float(fullness),
        "shape_weights": shape_weights
    }

    with open(AVATAR_DATA_PATH, "w") as f:
        json.dump(output, f, indent=4)

    print("✅ Body shape analysis completed.")
    print("Detected size:", body_size)
    print("Fullness score:", fullness)
    print("Weights:", shape_weights)


if __name__ == "__main__":
    run_body_shape()