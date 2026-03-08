# create_silhouette.py
import os
import cv2
import numpy as np
import mediapipe as mp

from mediapipe.tasks import python
from mediapipe.tasks.python import vision


def create_front_silhouette(
    img_path: str = os.path.join("outputs", "front_processed.jpg"),
    out_path: str = os.path.join("outputs", "front_silhouette.png"),
    out_inv_path: str = os.path.join("outputs", "front_silhouette_inv.png"),
    model_path: str = os.path.join("models", "selfie_segmenter.tflite"),
    threshold: float = 0.5,
    save_inverted: bool = True,
) -> str:
    """
    Creates a body silhouette using MediaPipe Tasks (ImageSegmenter).
    Saves:
      - outputs/front_silhouette.png (white body on black)
      - outputs/front_silhouette_inv.png (black body on white) [optional]

    Returns:
      out_path
    """

    # Ensure output directory exists
    os.makedirs(os.path.dirname(out_path) or "outputs", exist_ok=True)

    # Check model exists
    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Missing model file: {model_path}\n"
            f"Place your segmentation model at: {model_path}"
        )

    # Load image
    img_bgr = cv2.imread(img_path)
    if img_bgr is None:
        raise FileNotFoundError(f"Missing required file: {img_path}")

    # Convert to RGB for MediaPipe
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

    # Create MediaPipe Image
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)

    # Setup ImageSegmenter
    base_options = python.BaseOptions(model_asset_path=model_path)
    options = vision.ImageSegmenterOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.IMAGE,
        output_confidence_masks=True,   # gives float masks (0..1)
        output_category_mask=False
    )

    with vision.ImageSegmenter.create_from_options(options) as segmenter:
        result = segmenter.segment(mp_image)

    # Extract confidence mask (best for thresholding)
    # Most selfie/body segmentation models output 1 confidence mask.
    if result.confidence_masks and len(result.confidence_masks) > 0:
        conf = result.confidence_masks[0].numpy_view()  # float32 0..1
        mask = conf > float(threshold)
    else:
        raise RuntimeError("Segmentation failed: no confidence mask returned")

    # Create silhouette (black background, white body)
    silhouette = np.zeros_like(img_bgr)
    silhouette[mask] = (255, 255, 255)

    # Save output
    cv2.imwrite(out_path, silhouette)

    # Optional inverted version (white background, black body)
    if save_inverted:
        inv = np.full_like(img_bgr, 255)
        inv[mask] = (0, 0, 0)
        cv2.imwrite(out_inv_path, inv)

    print(f"✅ front_silhouette.png created: {out_path}")
    if save_inverted:
        print(f"✅ front_silhouette_inv.png created: {out_inv_path}")

    return out_path


# If you want to run this file directly:
if __name__ == "__main__":
    create_front_silhouette()
