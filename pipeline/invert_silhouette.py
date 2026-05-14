import os
import cv2


def invert_front_silhouette():
    """
    Inverts the front silhouette image:
    - white body  -> black body
    - black bg    -> white bg
    Saves result as outputs/front_silhouette_inv.png
    """

    # Ensure output directory exists
    os.makedirs("outputs", exist_ok=True)

    in_path = os.path.join("outputs", "front_silhouette.png")
    out_path = os.path.join("outputs", "front_silhouette_inv.png")

    # Load silhouette (grayscale)
    img = cv2.imread(in_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise FileNotFoundError(f"Missing required file: {in_path}")

    # Force clean binary image
    _, bw = cv2.threshold(img, 10, 255, cv2.THRESH_BINARY)

    # Invert colors
    inv = 255 - bw

    # Save inverted silhouette
    cv2.imwrite(out_path, inv)

    print("✅ front_silhouette_inv.png created")

    return out_path
