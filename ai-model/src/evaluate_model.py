
from pathlib import Path
from ultralytics import YOLO

PROJECT_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = (
        PROJECT_DIR
        / "outputs"
        / "predictions"
        / "crack_seg_test-2"
        / "weights"
        / "best.pt"
)

DATASET_YAML = (
        PROJECT_DIR
        / "datasets"
        / "crack-seg"
        / "crack-seg.yaml"
)

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

if not DATASET_YAML.exists():
    raise FileNotFoundError(f"Dataset YAML not found: {DATASET_YAML}")

model = YOLO(str(MODEL_PATH))

metrics = model.val(
    data=str(DATASET_YAML),
    split="test",
    imgsz=640,
    batch=2,
    workers=0,
    plots=True,
    project=str(PROJECT_DIR / "outputs" / "evaluation"),
    name="crack_test"
)

print("\n--- TEST RESULTS ---")
print("Box mAP50:", metrics.box.map50)
print("Box mAP50-95:", metrics.box.map)
print("Mask mAP50:", metrics.seg.map50)
print("Mask mAP50-95:", metrics.seg.map)
