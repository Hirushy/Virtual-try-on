# detect_gender.py
import os
from pipeline.gender_model_infer import estimate_gender_with_confidence

def estimate_gender(proportions: dict) -> str:
    """
    Returns: "male" | "female" | "unknown"
    AI is used only if extremely confident + strong margin.
    Otherwise -> unknown (so build_avatar_data can use proportions-based gender).
    """

    inv_path = os.path.join("outputs", "front_silhouette_inv.png")
    sil_path = os.path.join("outputs", "front_silhouette.png")
    img_path = inv_path if os.path.exists(inv_path) else sil_path

    if not os.path.exists(img_path):
        return "unknown"

    try:
        label, conf, margin, probs = estimate_gender_with_confidence(img_path)
        print(f"[GENDER AI FINAL] label={label} conf={conf:.2f} margin={margin:.2f} probs={probs}")

        # label already "unknown" if not strong
        return label
    except Exception as e:
        print(f"[GENDER AI ERROR] {e}")
        return "unknown"
