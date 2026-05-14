# estimate_body_safe.py
import json
import math
import os

# ===================== PATHS =====================
OUTPUT_DIR = "outputs"
LANDMARKS_PATH = os.path.join(OUTPUT_DIR, "landmarks.json")
PROPORTIONS_PATH = os.path.join(OUTPUT_DIR, "body_proportions.json")


# ===================== HELPERS =====================
def _dist(p1, p2) -> float:
    """2D distance between two landmark points"""
    try:
        return math.sqrt(
            (p1["x"] - p2["x"]) ** 2 +
            (p1["y"] - p2["y"]) ** 2
        )
    except Exception:
        return 0.0


def _by_id(points_list):
    """Convert landmark list [{id,x,y,...}] → {id: point}"""
    d = {}
    for p in points_list or []:
        try:
            d[int(p["id"])] = p
        except Exception:
            pass
    return d


# ===================== MAIN SAFE ESTIMATION =====================
def run_safe_estimation(user_id: str = "guest"):
    """
    Privacy-safe body proportion estimation.
    Uses only relative ratios (no real measurements).
    """
    # 🎯 Dynamic paths based on user_id
    landmarks_path = os.path.join(OUTPUT_DIR, f"{user_id}_landmarks.json")
    proportions_path = os.path.join(OUTPUT_DIR, f"{user_id}_body_proportions.json")

    if not os.path.exists(landmarks_path):
        # Fallback to legacy path for backward compatibility
        legacy_path = os.path.join(OUTPUT_DIR, "landmarks.json")
        if os.path.exists(legacy_path):
            landmarks_path = legacy_path
        else:
            raise Exception(f"❌ {landmarks_path} not found. Run pose detection first.")

    with open(landmarks_path, "r") as f:
        landmarks = json.load(f)

    front_list = landmarks.get("front") or []
    side_list = landmarks.get("side") or []

    if not front_list:
        raise Exception("❌ Front landmarks missing.")

    front = _by_id(front_list)

    # ===================== MEDIAPIPE IDS =====================
    # Shoulders
    L_SHO = front.get(11)
    R_SHO = front.get(12)

    # Hips (CORRECT hips, not knees)
    L_HIP = front.get(23)
    R_HIP = front.get(24)

    # Wrists
    L_WRIST = front.get(15)

    # Ankles
    L_ANKLE = front.get(27)

    # Feet
    L_FOOT = front.get(31)

    # Nose
    NOSE = front.get(0)

    # ===================== MEASUREMENTS =====================

    # ✅ Shoulder width
    shoulder_width = _dist(L_SHO, R_SHO) if L_SHO and R_SHO else 0.0

    # ✅ Hip width (FIXED)
    hip_width = _dist(L_HIP, R_HIP) if L_HIP and R_HIP else 0.0

    # ✅ Waist width — use 50% midpoint between shoulder and hip
    # (40% was too close to the chest/armpit area and arm-influenced)
    waist_width = 0.0
    if L_SHO and L_HIP and R_SHO and R_HIP:
        left_waist = {
            "x": (L_SHO["x"] + L_HIP["x"]) / 2,
            "y": (L_SHO["y"] + L_HIP["y"]) / 2,
        }
        right_waist = {
            "x": (R_SHO["x"] + R_HIP["x"]) / 2,
            "y": (R_SHO["y"] + R_HIP["y"]) / 2,
        }
        waist_width = _dist(left_waist, right_waist)

    print(f"RAW LANDMARKS -> shoulder={shoulder_width:.4f}  "
          f"hip={hip_width:.4f}  waist={waist_width:.4f}")

    # Arm length (rough)
    arm_length = _dist(L_SHO, L_WRIST) if L_SHO and L_WRIST else 0.0

    # Leg length (rough)
    leg_length = _dist(L_HIP, L_ANKLE) if L_HIP and L_ANKLE else 0.0

    # Height (rough)
    height = _dist(NOSE, L_FOOT) if NOSE and L_FOOT else 0.0

    # ===================== OUTPUT =====================
    body_measurements_front = {
        "shoulder_width": shoulder_width,
        "waist_width": waist_width,
        "hip_width": hip_width,
        "arm_length": arm_length,
        "leg_length": leg_length,
        "height": height,
    }

    output_data = {
        "front": body_measurements_front,
        "has_side_image": True if side_list else False
    }

    with open(proportions_path, "w") as f:
        json.dump(output_data, f, indent=4)

    print(f"✅ {proportions_path} created safely!")


# ===================== RUN DIRECTLY =====================
if __name__ == "__main__":
    run_safe_estimation()
