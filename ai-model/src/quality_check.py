
import cv2
from pathlib import Path

# Find the project root automatically
PROJECT_DIR = Path(__file__).resolve().parent.parent

# Folder containing original images
INPUT_DIR = PROJECT_DIR / "datasets" / "raw"

# Minimum acceptable image dimensions
MIN_WIDTH = 256
MIN_HEIGHT = 256

# Initial heuristic thresholds; tune using your dataset
BLUR_THRESHOLD = 50.0
DARK_THRESHOLD = 50.0
BRIGHT_THRESHOLD = 220.0


def check_image_quality(image_path):
    image = cv2.imread(str(image_path))

    if image is None:
        print(f"\nERROR: Cannot read image: {image_path}")
        return

    height, width = image.shape[:2]

    # Convert to grayscale for quality analysis
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Higher variance usually indicates a sharper image
    blur_score = cv2.Laplacian(
        gray, cv2.CV_64F
    ).var()

    # Average pixel brightness: range 0-255
    brightness = gray.mean()

    print("\n" + "=" * 45)
    print(f"Image: {image_path.name}")
    print(f"Dimensions: {width} x {height}")
    print(f"Blur score: {blur_score:.2f}")
    print(f"Average brightness: {brightness:.2f}")

    issues = []

    if width < MIN_WIDTH or height < MIN_HEIGHT:
        issues.append("Image resolution is too small")

    if blur_score < BLUR_THRESHOLD:
        issues.append("Image may be blurry")

    if brightness < DARK_THRESHOLD:
        issues.append("Image may be too dark")

    if brightness > BRIGHT_THRESHOLD:
        issues.append("Image may be overexposed")

    if issues:
        print("QUALITY STATUS: REVIEW REQUIRED")
        for issue in issues:
            print(f"- {issue}")
    else:
        print("QUALITY STATUS: PASSED INITIAL CHECKS")

    print("=" * 45)


if __name__ == "__main__":
    if not INPUT_DIR.exists():
        print(f"Input folder not found: {INPUT_DIR}")
    else:
        image_files = [
            p for p in INPUT_DIR.iterdir()
            if p.is_file()
               and p.suffix.lower() in {
                   ".jpg", ".jpeg", ".png", ".bmp"
               }
        ]

        if not image_files:
            print("No images found in datasets/raw.")
            print("Add an image such as img.png first.")
        else:
            for image_path in image_files:
                check_image_quality(image_path)

            print("\nImage quality checking completed!")
