"""
Drop-in script for the InfraScan-CV project (same style as predict_cracks.py).

Setup:
  1. Copy the `infrascan_ai/` folder into the project root (next to src/ and datasets/).
  2. Put this file in src/.
  3. pip install scipy scikit-image
  4. python src/analyze_cracks.py
"""
import json
import sys
from pathlib import Path

import cv2

PROJECT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_DIR))            # so `import infrascan_ai` works from src/

from infrascan_ai import analyze_image, load_model, Scale   # noqa: E402

# ---- edit these -------------------------------------------------------------
MODEL_PATH = PROJECT_DIR / "outputs" / "predictions" / "crack_seg_test-2" / "weights" / "best.pt"
IMAGE_PATH = PROJECT_DIR / "datasets" / "crack-seg" / "images" / "test" / "1813.rf.79f1af872f76dd8b46df4a83ed5f54c6.jpg"
PREV_IMAGE_PATH = None                           # earlier photo of the same spot, or None
OUTPUT_DIR = PROJECT_DIR / "outputs" / "analysis"

# Scale: set when the photo contains an object of known size, e.g. 100 mm = 250 px.
# Leave as None and all results stay in pixels (spec rule: never fake mm).
SCALE = None                                     # e.g. Scale.from_reference(100, 250)

INFRASTRUCTURE_TYPE = "bridge"                   # building / bridge / road / tunnel / dam ...
ASSET_IMPORTANCE = "medium"                      # low / medium / high / critical
# -----------------------------------------------------------------------------

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Trained model not found: {MODEL_PATH}")
if not IMAGE_PATH.exists():
    raise FileNotFoundError(f"Input image not found: {IMAGE_PATH}")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
model = load_model(MODEL_PATH)

out = analyze_image(model, IMAGE_PATH, scale=SCALE,
                    infrastructure_type=INFRASTRUCTURE_TYPE, asset_importance=ASSET_IMPORTANCE,
                    prev_image=PREV_IMAGE_PATH)
res = out["analysis"]

cv2.imwrite(str(OUTPUT_DIR / "mask.png"), out["mask"])
cv2.imwrite(str(OUTPUT_DIR / "overlay.png"), out["overlay"])
(OUTPUT_DIR / "analysis.json").write_text(json.dumps(res, indent=2), encoding="utf-8")

g, s, p = res["geometry"], res["severity"], res["priority"]
print(f"\nCracks found     : {g['num_cracks']}  (unit: {g['unit']})")
print(f"Crack density    : {g['crack_density_pct']}%")
print(f"Max crack width  : {g['max_width_px']} px")
print(f"Severity         : {s['label']}  (score {s['score']}, confidence {s['confidence']})")
for why in s["explanation"]:
    print(f"   - {why}")
print(f"Priority         : {p['priority']}  | alert: {p['alert_level']} | follow-up in {p['follow_up_days']} days")
for a in p["recommended_actions"]:
    print(f"   * {a}")
if res["progression"]:
    print(f"Progression      : {res['progression']['trend']}")
print(f"\nSaved to: {OUTPUT_DIR}")
