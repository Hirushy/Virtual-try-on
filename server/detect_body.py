# detect_body.py  (MediaPipe Tasks version - compatible)
import os
import json
import cv2
import numpy as np

# ✅ IMPORTANT: use compatibility wrapper instead of direct mediapipe import
from mp_compat import mp

from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision as mp_vision

# ===================== CONFIG =====================
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
MODEL_PATH = os.path.join("models", "pose_landmarker_full.task")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ===================== LANDMARKER INIT =====================
_LANDMARKER = None


def _create_pose_landmarker():
    """
    Create MediaPipe Tasks PoseLandmarker.
    Requires a local .task file at models/pose_landmarker_full.task
    """
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Missing model file: {MODEL_PATH}\n"
            "Put pose_landmarker_full.task inside server/models/"
        )

    base_options = mp_tasks.BaseOptions(model_asset_path=MODEL_PATH)

    options = mp_vision.PoseLandmarkerOptions(
        base_options=base_options,
        running_mode=mp_vision.RunningMode.IMAGE,
        output_segmentation_masks=False,  # we build silhouette ourselves
        num_poses=1,
    )

    return mp_vision.PoseLandmarker.create_from_options(options)


def _get_landmarker():
    global _LANDMARKER
    if _LANDMARKER is None:
        _LANDMARKER = _create_pose_landmarker()
    return _LANDMARKER


# ===================== HELPERS =====================
def _read_bgr(path: str):
    img = cv2.imread(path)
    if img is None:
        print(f"❌ Image not found or unreadable: {path}")
    return img


def _save_json(data, out_path: str):
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)


def _draw_landmarks_simple(img_bgr, points_xy):
    """
    Minimal drawing: circles + a few connecting lines.
    points_xy: list[(x_px, y_px)]
    """
    out = img_bgr.copy()

    # Draw points
    for (x, y) in points_xy:
        cv2.circle(out, (x, y), 3, (0, 255, 0), -1)

    # Simple skeleton connections (indices match MediaPipe pose landmark ids)
    connections = [
        (11, 12), (11, 13), (13, 15),  # left arm
        (12, 14), (14, 16),            # right arm
        (11, 23), (12, 24), (23, 24),  # torso
        (23, 25), (25, 27),            # left leg
        (24, 26), (26, 28),            # right leg
    ]

    for a, b in connections:
        if a < len(points_xy) and b < len(points_xy):
            cv2.line(out, points_xy[a], points_xy[b], (255, 0, 0), 2)

    return out


def _save_silhouettes_from_points(h, w, points_xy, out_base_name: str):
    """
    Create a silhouette using convex hull over landmark points.

    Saves:
      outputs/<base>_silhouette.png
      outputs/<base>_silhouette_inv.png
    """
    if points_xy is None or len(points_xy) < 6:
        return False

    mask = np.zeros((h, w), dtype=np.uint8)
    pts = np.array(points_xy, dtype=np.int32)

    hull = cv2.convexHull(pts)
    cv2.fillConvexPoly(mask, hull, 255)

    # Smooth / fill gaps
    kernel = np.ones((9, 9), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)

    sil_path = os.path.join(OUTPUT_DIR, f"{out_base_name}_silhouette.png")
    sil_inv_path = os.path.join(OUTPUT_DIR, f"{out_base_name}_silhouette_inv.png")

    cv2.imwrite(sil_path, mask)
    cv2.imwrite(sil_inv_path, 255 - mask)

    print(f"🖼️ Silhouette saved: {sil_path}")
    print(f"🖼️ Silhouette saved: {sil_inv_path}")
    return True


def process_image(image_path: str, processed_name: str, out_base_name: str):
    """
    Detect landmarks using PoseLandmarker and generate:
    - outputs/<processed_name> (debug drawing)
    - outputs/<out_base_name>_silhouette.png
    - outputs/<out_base_name>_silhouette_inv.png

    Returns landmarks_list (list of dicts) or None.
    """
    img = _read_bgr(image_path)
    if img is None:
        return None

    h, w = img.shape[:2]

    # Convert to MediaPipe Image (RGB)
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)

    landmarker = _get_landmarker()
    result = landmarker.detect(mp_image)

    if not result.pose_landmarks or len(result.pose_landmarks) == 0:
        print(f"⚠️ No landmarks detected for: {image_path}")
        return None

    # Use first pose
    lms = result.pose_landmarks[0]

    landmarks_list = []
    points_xy = []

    for idx, lm in enumerate(lms):
        # Convert normalized coords to pixels
        x_px = int(lm.x * w)
        y_px = int(lm.y * h)

        # Clamp inside image
        x_px = max(0, min(w - 1, x_px))
        y_px = max(0, min(h - 1, y_px))

        points_xy.append((x_px, y_px))

        landmarks_list.append({
            "id": idx,
            "x": float(lm.x),
            "y": float(lm.y),
            "z": float(lm.z),
            "visibility": 1.0,  # Tasks output doesn't always include visibility
        })

    # Save processed debug image
    drawn = _draw_landmarks_simple(img, points_xy)
    out_path = os.path.join(OUTPUT_DIR, processed_name)
    cv2.imwrite(out_path, drawn)
    print(f"🖼️ Processed image saved: {out_path}")

    # Save silhouettes
    ok = _save_silhouettes_from_points(h, w, points_xy, out_base_name)
    if not ok:
        print(f"⚠️ Silhouette not generated (not enough points): {image_path}")

    return landmarks_list


# ===================== MAIN PIPELINE =====================
def main():
    front_path = os.path.join(UPLOAD_DIR, "front.jpg")
    if not os.path.exists(front_path):
        raise FileNotFoundError("Front image missing: uploads/front.jpg")

    front_landmarks = process_image(front_path, "front_processed.jpg", "front")

    side_path = os.path.join(UPLOAD_DIR, "side.jpg")
    side_landmarks = process_image(side_path, "side_processed.jpg", "side") if os.path.exists(side_path) else None

    all_landmarks = {"front": front_landmarks, "side": side_landmarks}

    landmarks_json_path = os.path.join(OUTPUT_DIR, "landmarks.json")
    _save_json(all_landmarks, landmarks_json_path)
    print(f"✅ {landmarks_json_path} created!")


def run_pose_detection():
    main()


if __name__ == "__main__":
    main()
