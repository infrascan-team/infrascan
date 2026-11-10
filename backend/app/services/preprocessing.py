"""
InfraScan Preprocessing & Quality Assessment Service
Performs format validation, blur scoring, brightness checks, and CLAHE contrast enhancement.
"""
import os
from pathlib import Path
from typing import Dict, Any, List
import cv2
import numpy as np

MIN_WIDTH = 256
MIN_HEIGHT = 256
BLUR_THRESHOLD = 50.0
DARK_THRESHOLD = 50.0
BRIGHT_THRESHOLD = 220.0
MAX_PREPROCESS_WIDTH = 1920

def assess_and_preprocess_image(
    image_path: str,
    output_dir: str = "./uploads/preprocessed",
    base_url_prefix: str = "/uploads/preprocessed"
) -> Dict[str, Any]:
    """
    Analyzes image quality and generates an enhanced, normalized copy using CLAHE.
    """
    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f"Image not found at {image_path}")

    image = cv2.imread(str(path))
    if image is None:
        raise ValueError(f"Unable to decode image at {image_path}")

    height, width = image.shape[:2]
    file_size = os.path.getsize(str(path))

    # Convert to grayscale for quality metrics
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # 1. Blur score via Laplacian variance
    blur_score_val = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    blur_score = "Pass" if blur_score_val >= BLUR_THRESHOLD else "Warning"

    # 2. Brightness evaluation
    brightness = float(gray.mean())

    issues: List[str] = []
    if width < MIN_WIDTH or height < MIN_HEIGHT:
        issues.append(f"Image resolution ({width}x{height}) is below minimum recommended {MIN_WIDTH}x{MIN_HEIGHT}")

    if blur_score_val < BLUR_THRESHOLD:
        issues.append(f"Image blur metric is low ({blur_score_val:.1f} < {BLUR_THRESHOLD:.1f})")

    if brightness < DARK_THRESHOLD:
        blur_score = "Low-Light Warning"
        issues.append(f"Image is under-exposed / dark (mean brightness {brightness:.1f})")
    elif brightness > BRIGHT_THRESHOLD:
        issues.append(f"Image is over-exposed (mean brightness {brightness:.1f})")

    # 3. Composite quality score (0 - 100)
    # Scaled based on blur (up to 50 pts), brightness optimality (30 pts), and resolution (20 pts)
    blur_pts = min(50.0, (blur_score_val / (BLUR_THRESHOLD * 2.0)) * 50.0)
    brightness_dev = abs(brightness - 128.0) / 128.0  # 0 is ideal, 1 is extreme
    bright_pts = max(0.0, 30.0 * (1.0 - brightness_dev))
    res_pts = min(20.0, (width * height / (1920 * 1080)) * 20.0)
    quality_score = int(round(min(100.0, max(15.0, blur_pts + bright_pts + res_pts))))

    # 4. Image Enhancement (Resizing + CLAHE)
    processed = image.copy()
    if width > MAX_PREPROCESS_WIDTH:
        scale = MAX_PREPROCESS_WIDTH / float(width)
        new_w = MAX_PREPROCESS_WIDTH
        new_h = int(height * scale)
        processed = cv2.resize(processed, (new_w, new_h), interpolation=cv2.INTER_AREA)

    # CLAHE on Lightness channel
    lab = cv2.cvtColor(processed, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced_l = clahe.apply(l_channel)
    enhanced_lab = cv2.merge((enhanced_l, a_channel, b_channel))
    enhanced_bgr = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

    # 5. Save enhanced image
    os.makedirs(output_dir, exist_ok=True)
    out_filename = f"preprocessed_{path.name}"
    out_path = os.path.join(output_dir, out_filename)
    cv2.imwrite(out_path, enhanced_bgr)

    preprocessed_url = f"{base_url_prefix.rstrip('/')}/{out_filename}"

    return {
        "filename": path.name,
        "resolution": f"{width} x {height}",
        "fileSizeBytes": file_size,
        "qualityScore": quality_score,
        "blurScore": blur_score,
        "blurVariance": round(blur_score_val, 2),
        "brightness": round(brightness, 2),
        "isAcceptable": len(issues) == 0,
        "issues": issues,
        "preprocessedUrl": preprocessed_url,
    }

