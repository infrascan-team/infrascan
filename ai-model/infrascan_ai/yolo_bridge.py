"""
Glue between the YOLO-seg crack model (ultralytics) and the post-CV AI layer.

    image --YOLO-seg--> polygons --> binary mask --> analyze() --> severity / priority / ...

ultralytics is imported lazily, so the rest of the package works without it.
"""
from __future__ import annotations

from pathlib import Path
from typing import Optional, Union

import cv2
import numpy as np

from .config import DEFAULT_CONFIG
from .geometry import measure_cracks
from .pipeline import analyze
from .schemas import Scale
from .visualization import overlay

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp"}


def load_model(weights: Union[str, Path]):
    """Load a trained ultralytics YOLO-seg model (e.g. .../weights/best.pt)."""
    try:
        from ultralytics import YOLO
    except ImportError as e:
        raise ImportError("ultralytics is required for the YOLO bridge: pip install ultralytics") from e
    p = Path(weights)
    if not p.exists():
        raise FileNotFoundError(f"Weights not found: {p}")
    return YOLO(str(p))


def result_to_mask(result) -> np.ndarray:
    """
    Union of all predicted instance polygons as a uint8 mask (255 = crack) at the ORIGINAL
    image size. Uses `masks.xy` (polygons in original-image coordinates), not `masks.data`,
    which lives in the 640px letterboxed space and would misalign with the photo.
    """
    h, w = result.orig_shape[:2]
    mask = np.zeros((h, w), np.uint8)
    masks = getattr(result, "masks", None)
    if masks is not None:
        for poly in masks.xy:
            pts = np.round(np.asarray(poly)).astype(np.int32)
            if pts.ndim == 2 and len(pts) >= 3:
                cv2.fillPoly(mask, [pts], 255)
    return mask


def mean_confidence(result) -> float:
    """Mean detection confidence; 1.0 when nothing was detected (empty mask anyway)."""
    boxes = getattr(result, "boxes", None)
    conf = getattr(boxes, "conf", None) if boxes is not None else None
    if conf is None:
        return 1.0
    conf = conf.cpu().numpy() if hasattr(conf, "cpu") else np.asarray(conf)
    return float(conf.mean()) if conf.size else 1.0


def predict_mask(model, image, conf: float = 0.15, imgsz: int = 640):
    """Run the model on one image (path or BGR array). Returns (mask, image_bgr, confidence)."""
    src = str(image) if isinstance(image, (str, Path)) else image
    r = model.predict(source=src, imgsz=imgsz, conf=conf, verbose=False)[0]
    return result_to_mask(r), r.orig_img, mean_confidence(r)


def analyze_image(model,
                  image,
                  scale: Optional[Scale] = None,
                  conf: float = 0.15,
                  imgsz: int = 640,
                  damage_types: Optional[list] = None,
                  damage_area_pct: float = 0.0,
                  infrastructure_type: str = "building",
                  asset_importance: str = "medium",
                  prev_image=None,
                  prev_scale: Optional[Scale] = None,
                  config: Optional[dict] = None) -> dict:
    """
    One call: image -> YOLO-seg -> mask -> full analysis.

    model : an ultralytics YOLO object, or a path to weights (loaded for you)
    image : file path or BGR numpy array
    prev_image : earlier inspection photo of the same spot (enables progression)

    Returns {"analysis": dict, "mask": ndarray, "image": ndarray, "overlay": ndarray}
    """
    cfg = config or DEFAULT_CONFIG
    if isinstance(model, (str, Path)):
        model = load_model(model)

    mask, img, model_conf = predict_mask(model, image, conf, imgsz)

    prev_mask = prev_img = None
    if prev_image is not None:
        prev_mask, prev_img, _ = predict_mask(model, prev_image, conf, imgsz)

    result = analyze(mask, img, scale=scale, damage_types=damage_types,
                     damage_area_pct=damage_area_pct, model_confidence=model_conf,
                     infrastructure_type=infrastructure_type, asset_importance=asset_importance,
                     prev_mask=prev_mask, prev_image=prev_img, prev_scale=prev_scale,
                     config=cfg)
    vis = overlay(img, measure_cracks(mask, scale, min_area_px=cfg["min_crack_area_px"],
                                    max_hole_px=cfg["fill_hole_px"],
                                    hole_thickness_px=cfg["fill_hole_thickness_px"]))
    return {"analysis": result, "mask": mask, "image": img, "overlay": vis}