# build_silhouette_dataset.py
import os
from pathlib import Path
import shutil

from detect_body import run_pose_detection  # uses uploads/front.jpg -> outputs/front_silhouette_inv.png

RAW_DIR = "raw_photos"   # raw_photos/female , raw_photos/male
OUT_DIR = "dataset"      # dataset/female , dataset/male

UPLOADS_DIR = "uploads"
OUTPUTS_DIR = "outputs"

IMG_EXTS = {".jpg", ".jpeg", ".png"}


def ensure_dir(p: str):
    os.makedirs(p, exist_ok=True)


def _clear_previous_outputs():
    """
    Prevent copying an old silhouette when detection fails.
    """
    for fname in [
        "front_silhouette.png",
        "front_silhouette_inv.png",
        "front_processed.jpg",
        "landmarks.json",
    ]:
        fpath = os.path.join(OUTPUTS_DIR, fname)
        if os.path.exists(fpath):
            try:
                os.remove(fpath)
            except:
                pass


def process_one_image(src_path: str, out_path: str):
    """
    1) Copy raw photo -> uploads/front.jpg
    2) Run detect_body.run_pose_detection() (creates outputs/front_silhouette_inv.png)
    3) Copy silhouette -> dataset/<class>/<name>.png
    """
    ensure_dir(UPLOADS_DIR)
    ensure_dir(OUTPUTS_DIR)

    _clear_previous_outputs()

    # Put the image where detect_body.py expects it
    front_path = os.path.join(UPLOADS_DIR, "front.jpg")
    shutil.copy(src_path, front_path)

    # Run your pipeline step (reads uploads/front.jpg)
    run_pose_detection()

    sil_inv_path = os.path.join(OUTPUTS_DIR, "front_silhouette_inv.png")
    if not os.path.exists(sil_inv_path):
        raise FileNotFoundError(
            f"Silhouette not created for: {src_path}\n"
            f"Expected: {sil_inv_path}\n"
            "Reason: MediaPipe did not detect landmarks (bad pose/crop), or dependencies missing."
        )

    shutil.copy(sil_inv_path, out_path)


def main():
    # Create output folders
    for cls in ["female", "male"]:
        ensure_dir(os.path.join(OUT_DIR, cls))

    for cls in ["female", "male"]:
        src_dir = Path(RAW_DIR) / cls
        dst_dir = Path(OUT_DIR) / cls

        if not src_dir.exists():
            print(f"⚠️ Missing folder: {src_dir} (skip)")
            continue

        files = [p for p in src_dir.glob("*") if p.suffix.lower() in IMG_EXTS]
        print(f"\n{cls}: {len(files)} raw images")

        ok = 0
        fail = 0

        for i, p in enumerate(files, start=1):
            out_name = f"{cls}_{i:04d}.png"
            out_path = dst_dir / out_name

            try:
                process_one_image(str(p), str(out_path))
                ok += 1
                print(f"✅ {cls} {i}/{len(files)} -> {out_name}")
            except Exception as e:
                fail += 1
                print(f"❌ Failed {p.name}: {e}")

        print(f"➡️ {cls} done: success={ok}, failed={fail}")

    print("\n✅ Done. dataset/ now matches your pipeline silhouettes.")


if __name__ == "__main__":
    main()
