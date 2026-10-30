
import cv2
from pathlib import Path

# Project root: InfraScan-CV
PROJECT_DIR = Path(__file__).resolve().parent.parent

# Input and output folders
INPUT_DIR = PROJECT_DIR / "datasets" / "raw"
OUTPUT_DIR = PROJECT_DIR / "outputs" / "preprocessed"

# Create output folder automatically
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def preprocess_image(image_path):
    image = cv2.imread(str(image_path))

    if image is None:
        print(f"ERROR: Could not read image: {image_path}")
        return

    print(f"Original image: {image_path}")
    print(f"Original dimensions: {image.shape[1]} x {image.shape[0]}")

    # 1. Resize while preserving aspect ratio
    height, width = image.shape[:2]
    max_width = 1024

    if width > max_width:
        scale = max_width / width
        new_width = max_width
        new_height = int(height * scale)

        image = cv2.resize(
            image,
            (new_width, new_height),
            interpolation=cv2.INTER_AREA
        )

    # 2. Convert to LAB color space
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    lightness, a, b = cv2.split(lab)

    # 3. Improve local contrast
    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8)
    )

    lightness = clahe.apply(lightness)

    # 4. Merge channels and convert back to BGR
    enhanced_lab = cv2.merge((lightness, a, b))
    enhanced_image = cv2.cvtColor(
        enhanced_lab,
        cv2.COLOR_LAB2BGR
    )

    # 5. Save the processed image
    output_path = OUTPUT_DIR / image_path.name
    saved = cv2.imwrite(str(output_path), enhanced_image)

    if saved:
        print(f"SUCCESS: Processed image saved to:\n{output_path}")
    else:
        print(f"ERROR: Could not save image to:\n{output_path}")


if __name__ == "__main__":
    print("Input folder:", INPUT_DIR)
    print("Output folder:", OUTPUT_DIR)

    if not INPUT_DIR.exists():
        print("ERROR: Input folder does not exist.")
    else:
        image_files = [
            p for p in INPUT_DIR.iterdir()
            if p.is_file()
               and p.suffix.lower() in {".jpg", ".jpeg", ".png", ".bmp"}
        ]

        if not image_files:
            print("No images found. Put img.png inside datasets/raw.")
        else:
            for image_path in image_files:
                preprocess_image(image_path)

            print("Preprocessing finished.")
