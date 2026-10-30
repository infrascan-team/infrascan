"""One-call pipeline: mask (+ context) -> geometry, severity, priority, progression."""
from __future__ import annotations

import json
from dataclasses import asdict
from typing import Optional

import numpy as np

from .config import DEFAULT_CONFIG
from .geometry import measure_cracks
from .priority import prioritize
from .progression import compare_inspections
from .schemas import Scale
from .severity import assess_severity

_SKIP = {"aligned_prev_mask", "skeleton", "labels", "comp_label"}


def _clean(d: dict) -> dict:
    return {k: v for k, v in d.items() if k not in _SKIP}


def _json_safe(obj):
    return json.loads(json.dumps(obj, default=lambda o: o.item() if hasattr(o, "item") else str(o)))


def analyze(mask: np.ndarray,
            image: Optional[np.ndarray] = None,
            scale: Optional[Scale] = None,
            damage_types: Optional[list] = None,
            damage_area_pct: float = 0.0,
            model_confidence: float = 1.0,
            infrastructure_type: str = "building",
            asset_importance: str = "medium",
            prev_mask: Optional[np.ndarray] = None,
            prev_image: Optional[np.ndarray] = None,
            prev_scale: Optional[Scale] = None,
            surface_mask: Optional[np.ndarray] = None,
            config: Optional[dict] = None) -> dict:
    """
    Returns a JSON-serialisable dict:
      {geometry, severity, priority, progression|None, meta}
    Use geometry via measure_cracks() directly if you also need the numpy skeleton/labels.
    """
    cfg = config or DEFAULT_CONFIG
    shape = image.shape if image is not None else mask.shape

    geom = measure_cracks(mask, scale, surface_mask, cfg["min_crack_area_px"],
                         cfg["fill_hole_px"], cfg["fill_hole_thickness_px"])
    sev = assess_severity(geom, shape, scale, damage_types, damage_area_pct,
                          model_confidence, cfg)
    prog = (compare_inspections(prev_mask, mask, prev_image, image, prev_scale, scale, cfg)
            if prev_mask is not None else None)
    pri = prioritize(sev, prog, infrastructure_type, asset_importance, config=cfg)

    out = {
        "geometry": {
            "unit": geom.unit,
            "calibrated": geom.calibrated,
            "num_cracks": len(geom.cracks),
            "crack_density_pct": round(geom.crack_density_pct, 3),
            "total_crack_area_px": geom.total_crack_area_px,
            "total_length_px": round(geom.total_length_px, 1),
            "max_width_px": round(geom.max_width_px, 2),
            "width_p95_px": round(geom.width_p95_px, 2),
            "cracks": [asdict(c) for c in geom.cracks],
        },
        "severity": asdict(sev),
        "priority": asdict(pri),
        "progression": None if prog is None else _clean(asdict(prog)),
        "meta": {
            "infrastructure_type": infrastructure_type,
            "asset_importance": asset_importance,
            "model_confidence": model_confidence,
            "scale_mm_per_pixel": scale.mm_per_pixel if scale else None,
        },
    }
    return _json_safe(out)