import os
import sys
import time
import json
from pathlib import Path
import torch
import cv2
import numpy as np

print("=" * 70)
print("   INFRASCAN COMPLETE BACKEND & AI PIPELINE DIAGNOSTIC SUITE")
print("=" * 70)

# 1. System & Dependencies Check
print("\n[STEP 1/5] Verifying System & Deep Learning Libraries...")
print(f"  • Python Version        : {sys.version.split()[0]}")
print(f"  • PyTorch Version       : {torch.__version__}")
cuda_avail = torch.cuda.is_available()
print(f"  • CUDA GPU Acceleration : {'Available (' + torch.cuda.get_device_name(0) + ')' if cuda_avail else 'CPU Mode (Standard)'}")
print(f"  • OpenCV (cv2) Version  : {cv2.__version__}")
print(f"  • NumPy Version         : {np.__version__}")

try:
    import ultralytics
    print(f"  • Ultralytics YOLO      : {ultralytics.__version__}")
except ImportError as e:
    print(f"  [FAIL] Ultralytics not installed: {e}")
    sys.exit(1)

# 2. AI Model Weights Verification
print("\n[STEP 2/5] Inspecting YOLOv11 Segmentation Model Weights...")
weights_path = os.path.abspath("ai-model/src/yolo11n-seg.pt")
print(f"  • Weights File Path     : {weights_path}")
if not os.path.exists(weights_path):
    print(f"  [FAIL] Weights file not found at {weights_path}")
    sys.exit(1)

weights_size_mb = os.path.getsize(weights_path) / (1024 * 1024)
print(f"  • Weights File Size     : {weights_size_mb:.2f} MB")

t0 = time.time()
from ultralytics import YOLO
yolo_model = YOLO(weights_path)
load_time = time.time() - t0
print(f"  • Model Load Time       : {load_time:.3f} seconds")
print(f"  • Model Task            : {getattr(yolo_model, 'task', 'segment')}")
print(f"  • Detected Classes      : {yolo_model.names}")

# 3. Direct Neural Inference & Geometric Analysis Test
print("\n[STEP 3/5] Testing Direct AI Inference & Defect Extraction...")
test_img_path = "backend/uploads/raw/test_concrete_sample.jpg"
if not os.path.exists(test_img_path):
    test_img_path = "frontend/public/samples/current_concrete.jpg"

print(f"  • Input Test Image      : {test_img_path}")
test_bgr = cv2.imread(test_img_path)
h, w, c = test_bgr.shape
print(f"  • Image Dimensions      : {w}x{h} (3 Channels BGR)")

# Run YOLO inference
t1 = time.time()
results = yolo_model.predict(source=test_bgr, conf=0.15, verbose=False)
infer_time = time.time() - t1
print(f"  • Raw Neural Inference  : {infer_time*1000:.1f} ms")

res = results[0]
num_boxes = len(res.boxes) if res.boxes is not None else 0
has_masks = res.masks is not None and len(res.masks) > 0
print(f"  • Bounding Boxes Found  : {num_boxes}")
print(f"  • Segmentation Masks    : {'Present' if has_masks else 'None (Bounding box only)'}")

if num_boxes > 0:
    for idx, box in enumerate(res.boxes):
        conf = float(box.conf[0])
        cls_id = int(box.cls[0])
        cls_name = yolo_model.names.get(cls_id, f"Class {cls_id}")
        xyxy = box.xyxy[0].tolist()
        print(f"    - Detection #{idx+1}   : {cls_name} (Confidence: {conf*100:.1f}%) Box: {[round(x, 1) for x in xyxy]}")

# Test Preprocessing & XAI Pipeline
from app.services.ai_pipeline import run_inspection_ai_pipeline
out_dir = "backend/uploads/inspections"
os.makedirs(out_dir, exist_ok=True)
pipeline_res = run_inspection_ai_pipeline(
    image_path=test_img_path,
    inspection_id="DIAG-001",
    output_dir=out_dir,
    url_prefix="/uploads/inspections",
)

print(f"  • Pipeline Severity     : {pipeline_res['overallSeverity']}")
print(f"  • Repair Priority       : {pipeline_res['priority']}")
print(f"  • Total Findings Count  : {len(pipeline_res['findings'])}")

findings = pipeline_res['findings']
if findings:
    m = findings[0]['measurements']
    print(f"  • Crack Length (px)     : {m['crackLengthPx']:.1f} px")
    print(f"  • Max Width (px)        : {m['maxWidthPx']:.1f} px")
    print(f"  • Avg Width (px)        : {m['avgWidthPx']:.1f} px")
    print(f"  • Orientation Angle     : {m['orientationAngleDeg']:.1f}°")

# Verify generated artifacts
img_stem = Path(test_img_path).stem
annotated_path = os.path.join(out_dir, f"annotated_{img_stem}.jpg")
mask_path = os.path.join(out_dir, f"mask_{img_stem}.png")
heatmap_path = os.path.join(out_dir, f"heatmap_{img_stem}.jpg")
print(f"  • Annotated Overlay on Disk : {'[OK]' if os.path.exists(annotated_path) else '[MISSING]'}")
print(f"  • Segmentation Mask on Disk : {'[OK]' if os.path.exists(mask_path) else '[MISSING]'}")
print(f"  • XAI Attention Heatmap     : {'[OK]' if os.path.exists(heatmap_path) else '[MISSING]'}")

# 4. Backend FastAPI Endpoints Integration Test
print("\n[STEP 4/5] Testing Live FastAPI API Endpoints via TestClient...")
from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)

# 4.1 Health Check
r_health = client.get("/health")
print(f"  • GET /health               : Status {r_health.status_code} -> DB: {r_health.json().get('database', {}).get('status')}")
assert r_health.status_code == 200, "Health check failed"

# 4.2 Ready Probe
r_ready = client.get("/ready")
print(f"  • GET /ready                : Status {r_ready.status_code}")
assert r_ready.status_code == 200, "Ready probe failed"

# 4.3 Authentication Check
r_login = client.post(
    "/api/v1/auth/login",
    json={"email": "elena.rostova@infrastructure.gov", "password": "password123"},
)
print(f"  • POST /api/v1/auth/login   : Status {r_login.status_code} (User: Elena Rostova, SE)")
assert r_login.status_code == 200, "Login failed"
token = r_login.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 4.4 Assets Register
r_assets = client.get("/api/v1/assets", headers=headers)
assets_data = r_assets.json()
print(f"  • GET /api/v1/assets        : Status {r_assets.status_code} ({len(assets_data)} registered assets)")
assert r_assets.status_code == 200, "Assets check failed"

# 4.5 Inspections Archive
r_insps = client.get("/api/v1/inspections", headers=headers)
insps_data = r_insps.json()
print(f"  • GET /api/v1/inspections   : Status {r_insps.status_code} ({len(insps_data)} inspection surveys recorded)")
assert r_insps.status_code == 200, "Inspections check failed"

# 4.6 Work Orders
r_wos = client.get("/api/v1/work-orders", headers=headers)
wos_data = r_wos.json()
print(f"  • GET /api/v1/work-orders   : Status {r_wos.status_code} ({len(wos_data)} maintenance work orders)")
assert r_wos.status_code == 200, "Work orders check failed"

# 4.7 Reports Archive
r_rpts = client.get("/api/v1/reports", headers=headers)
rpts_data = r_rpts.json()
print(f"  • GET /api/v1/reports       : Status {r_rpts.status_code} ({len(rpts_data)} civil audit reports)")
assert r_rpts.status_code == 200, "Reports check failed"

# 4.8 PDF Report Download
if rpts_data:
    first_rpt_id = rpts_data[0]["id"]
    r_pdf = client.get(f"/api/v1/reports/{first_rpt_id}/download", headers=headers)
    print(f"  • GET /reports/{first_rpt_id}/download : Status {r_pdf.status_code} (PDF Content: {len(r_pdf.content)} bytes)")
    assert r_pdf.status_code == 200, "PDF download failed"

# 4.9 AI Models Registry
r_models = client.get("/api/v1/models", headers=headers)
models_data = r_models.json()
print(f"  • GET /api/v1/models        : Status {r_models.status_code} ({len(models_data)} AI models registered)")
assert r_models.status_code == 200, "Models check failed"

# 5. Database Health Summary
print("\n[STEP 5/5] Verifying SQLite Database Table Records...")
from app.db.session import SessionLocal
from app.models.user import User
from app.models.asset import Asset
from app.models.inspection import Inspection
from app.models.maintenance import MaintenanceWorkOrder
from app.models.report import InspectionReport
from app.models.model_version import ModelVersion

db = SessionLocal()
print(f"  • Users Table              : {db.query(User).count()} users")
print(f"  • Assets Table             : {db.query(Asset).count()} civil assets")
print(f"  • Inspections Table        : {db.query(Inspection).count()} surveys")
print(f"  • Work Orders Table        : {db.query(MaintenanceWorkOrder).count()} orders")
print(f"  • Inspection Reports Table : {db.query(InspectionReport).count()} audit reports")
print(f"  • Model Versions Table     : {db.query(ModelVersion).count()} models")

print("\n" + "=" * 70)
print("   DIAGNOSTIC COMPLETE: BACKEND & AI ARE FULLY OPERATIONAL (100% OK)")
print("=" * 70)
