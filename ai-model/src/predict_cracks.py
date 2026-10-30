
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

IMAGE_PATH = PROJECT_DIR / "datasets" / "crack-seg"  / "images"/"test"/ "1813.rf.79f1af872f76dd8b46df4a83ed5f54c6.jpg"

OUTPUT_DIR = PROJECT_DIR / "outputs" / "predictions"

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Trained model not found: {MODEL_PATH}")

if not IMAGE_PATH.exists():
    raise FileNotFoundError(f"Input image not found: {IMAGE_PATH}")

model = YOLO(str(MODEL_PATH))

results = model.predict(
    source=str(IMAGE_PATH),
    imgsz=640,
    conf=0.15,
    save=True,
    show=False,
    project=str(OUTPUT_DIR),
    name="crack_demo",
    exist_ok=True
)

print("\nPrediction completed!")
print("Results saved in:", OUTPUT_DIR / "crack_demo")

for result in results:
    if result.masks is not None:
        print("Crack masks detected:", len(result.masks))
    else:
        print("No crack masks detected in this image.")
