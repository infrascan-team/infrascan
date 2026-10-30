
from pathlib import Path
from ultralytics import YOLO

# 1. Set the correct project and dataset paths
PROJECT_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = PROJECT_DIR / "datasets" / "crack-seg"
OUTPUT_DIR = PROJECT_DIR / "outputs" / "predictions"

# 2. Verify images and labels
for split in ("train", "val", "test"):
    image_dir = DATASET_DIR / "images" / split
    label_dir = DATASET_DIR / "labels" / split

    if not image_dir.is_dir():
        raise FileNotFoundError(f"Image folder missing: {image_dir}")

    if not label_dir.is_dir():
        raise FileNotFoundError(f"Label folder missing: {label_dir}")

    images = [
        p for p in image_dir.iterdir()
        if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".bmp"}
    ]
    labels = list(label_dir.glob("*.txt"))

    print(f"{split}: {len(images)} images, {len(labels)} label files")

    if not images:
        raise ValueError(f"No images found in {image_dir}")

    if split in ("train", "val") and not labels:
        raise ValueError(f"No YOLO annotation files found in {label_dir}")

# 3. Create the dataset configuration
yaml_path = DATASET_DIR / "crack-seg.yaml"

yaml_content = f"""
path: '{DATASET_DIR.as_posix()}'
train: images/train
val: images/val
test: images/test

names:
  0: crack
"""

yaml_path.write_text(yaml_content.strip() + "\n", encoding="utf-8")
print(f"\nDataset configuration saved: {yaml_path}")

# 4. Load the pretrained YOLO segmentation model
model = YOLO("yolo11n-seg.pt")

# 5. Run a short training test
model.train(
    data=str(yaml_path),
    epochs=1,
    imgsz=640,
    batch=2,
    workers=0,
    project=str(OUTPUT_DIR),
    name="crack_seg_test"
)

print("\nTraining completed!")
print("Check outputs/predictions/crack_seg_test for results.")
