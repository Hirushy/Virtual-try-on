# gender_model.py
import os
import cv2
import numpy as np
import mediapipe as mp

from mediapipe.tasks import python
from mediapipe.tasks.python import vision


MODEL_PATH = os.path.join("models", "selfie_segmenter.tflite")


def extract_silhouette(
    image_path: str,
    size: int = 224,
    threshold: float = 0.5
) -> np.ndarray:
    """
    Returns a 224x224 binary silhouette (0 or 255) using MediaPipe Tasks.
    Privacy-safe: removes face details and texture.
    """

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Missing segmentation model: {MODEL_PATH}"
        )

    # Load image
    bgr = cv2.imread(image_path)
    if bgr is None:
        raise FileNotFoundError(f"Cannot read image: {image_path}")

    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)

    # MediaPipe Image
    mp_image = mp.Image(
        image_format=mp.ImageFormat.SRGB,
        data=rgb
    )

    # Setup ImageSegmenter
    base_options = python.BaseOptions(
        model_asset_path=MODEL_PATH
    )

    options = vision.ImageSegmenterOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.IMAGE,
        output_confidence_masks=True,
        output_category_mask=False
    )

    with vision.ImageSegmenter.create_from_options(options) as segmenter:
        result = segmenter.segment(mp_image)

    if not result.confidence_masks:
        raise RuntimeError("Segmentation failed: no confidence mask")

    # Confidence mask (float 0..1)
    conf_mask = result.confidence_masks[0].numpy_view()

    # Binary silhouette
    mask = (conf_mask > threshold).astype(np.uint8) * 255

    # Resize to model input size
    silhouette = cv2.resize(
        mask,
        (size, size),
        interpolation=cv2.INTER_AREA
    )

    return silhouette
