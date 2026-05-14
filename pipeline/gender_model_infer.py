# gender_model_infer.py
import os
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import numpy as np

MODEL_PATH = os.path.join("models", "gender_silhouette.pt")

SIL_NORMAL_PATH = os.path.join("outputs", "front_silhouette.png")
SIL_INV_PATH = os.path.join("outputs", "front_silhouette_inv.png")

_DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
_MODEL = None
_CLASSES = None
_TRANSFORM = None

# ✅ AI trust rules
AI_CONF_THRESHOLD = 0.85          # only trust if very high
AI_MARGIN_THRESHOLD = 0.20        # AND clearly separated (prob gap)


def _load_rgb(path: str) -> Image.Image:
    return Image.open(path).convert("RGB")


def _build_transform(use_imagenet_norm: bool, img_size: int = 224):
    tf = [
        transforms.Grayscale(num_output_channels=3),
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
    ]
    if use_imagenet_norm:
        tf.append(
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            )
        )
    return transforms.Compose(tf)


def _load_model_and_transform():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Missing model file: {MODEL_PATH}")

    ckpt = torch.load(MODEL_PATH, map_location="cpu")

    classes = ckpt.get("classes", ["female", "male"])
    if not isinstance(classes, list) or len(classes) != 2:
        classes = ["female", "male"]

    use_imagenet_norm = bool(ckpt.get("use_imagenet_norm", False))
    img_size = int(ckpt.get("img_size", 224))

    model = models.mobilenet_v2(weights=None)
    model.classifier[1] = nn.Linear(model.last_channel, 2)
    model.load_state_dict(ckpt["model_state"], strict=True)
    model.eval()
    model.to(_DEVICE)

    transform = _build_transform(use_imagenet_norm, img_size=img_size)

    print(
        f"[GENDER MODEL] loaded | classes={classes} | imagenet_norm={use_imagenet_norm} | device={_DEVICE}"
    )

    return model, classes, transform


def _ensure_loaded():
    global _MODEL, _CLASSES, _TRANSFORM
    if _MODEL is None:
        _MODEL, _CLASSES, _TRANSFORM = _load_model_and_transform()


def _predict_probs(image_path: str):
    """
    Returns:
      probs_dict = {"female": p, "male": p}
      top_label, top_conf, margin
    """
    _ensure_loaded()

    img = _load_rgb(image_path)
    x = _TRANSFORM(img).unsqueeze(0).to(_DEVICE)

    with torch.inference_mode():
        logits = _MODEL(x)[0]
        probs = torch.softmax(logits, dim=0).detach().cpu().numpy().astype(float)

    # Map probs to class names safely
    p0, p1 = float(probs[0]), float(probs[1])
    c0, c1 = _CLASSES[0], _CLASSES[1]

    probs_by_class = {c0: p0, c1: p1}

    # Ensure keys exist
    pf = float(probs_by_class.get("female", 0.0))
    pm = float(probs_by_class.get("male", 0.0))

    if pm >= pf:
        top_label, top_conf, margin = "male", pm, (pm - pf)
    else:
        top_label, top_conf, margin = "female", pf, (pf - pm)

    return {"female": pf, "male": pm}, top_label, top_conf, margin


def _silhouette_candidates():
    cands = []
    if os.path.exists(SIL_INV_PATH):
        cands.append(SIL_INV_PATH)
    if os.path.exists(SIL_NORMAL_PATH):
        cands.append(SIL_NORMAL_PATH)
    return cands


def estimate_gender_with_confidence(image_path: str = None):
    """
    Returns:
      (label, conf, margin, probs_dict)
    label: female|male|unknown
    """
    # Direct path
    if image_path and os.path.exists(image_path):
        probs, label, conf, margin = _predict_probs(image_path)
        return label, conf, margin, probs

    # Pipeline silhouettes
    candidates = _silhouette_candidates()
    if not candidates:
        raise FileNotFoundError(
            f"No silhouette images found. Expected: {SIL_INV_PATH} or {SIL_NORMAL_PATH}"
        )

    best = None  # (label, conf, margin, probs, path)
    for p in candidates:
        probs, label, conf, margin = _predict_probs(p)
        print(f"[GENDER AI] {os.path.basename(p)} -> {label} conf={conf:.2f} margin={margin:.2f} probs={probs}")
        if best is None or conf > best[1]:
            best = (label, conf, margin, probs, p)

    label, conf, margin, probs, path = best

    # ✅ Only accept AI if it is VERY confident and has margin
    if conf >= AI_CONF_THRESHOLD and margin >= AI_MARGIN_THRESHOLD:
        return label, conf, margin, probs

    return "unknown", conf, margin, probs


if __name__ == "__main__":
    label, conf, margin, probs = estimate_gender_with_confidence()
    print(f"✅ Gender: {label} | conf={conf:.2f} | margin={margin:.2f} | probs={probs}")
