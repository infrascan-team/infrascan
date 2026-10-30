"""
Central configuration.

All severity thresholds here are PLACEHOLDERS. The spec requires them to be validated
against applicable engineering standards / engineer-defined criteria. Override them
without touching code via a JSON file:  load_config("configs/thresholds.json")
"""
from __future__ import annotations

import copy
import json
from typing import Optional

SEVERITY_LEVELS = [
    "No Visible Damage",
    "Minor Damage",
    "Moderate Damage",
    "Severe Damage",
    "Critical / Requires Urgent Engineering Review",
]
PRIORITY_LEVELS = ["Routine Monitoring", "Low Priority", "Medium Priority",
                   "High Priority", "Urgent Engineering Review"]
ALERT_LEVELS = ["Informational", "Low", "Medium", "High", "Critical"]

DEFAULT_CONFIG = {
    # [lower_bound, score] tables; the highest bound <= value wins
    "thresholds": {
        "width_mm":        [[0.0, 0], [0.1, 1], [0.3, 2], [1.0, 3], [3.0, 4]],
        "density_pct":     [[0.0, 0], [0.2, 1], [1.0, 2], [3.0, 3], [8.0, 4]],
        "rel_width_pct":   [[0.0, 0], [0.1, 1], [0.3, 2], [0.8, 3], [1.5, 4]],
        "length_density":  [[0.0, 0], [0.5, 1], [2.0, 2], [5.0, 3], [10.0, 4]],
    },
    "weights": {"width": 0.40, "density": 0.25, "length": 0.15,
                "branching": 0.10, "damage_type": 0.10},
    "damage_type_score": {
        "crack": 1, "hairline": 0, "alligator": 3, "spalling": 3,
        "exposed_reinforcement": 4, "corrosion": 3, "pothole": 3,
        "delamination": 3, "deformation": 3, "leakage": 2, "erosion": 2,
        "deterioration": 2,
    },
    "asset_importance": {"low": 0, "medium": 1, "high": 2, "critical": 3},
    "structural_types": ["bridge", "dam", "tunnel"],
    "follow_up_days": {"0": 365, "1": 180, "2": 90, "3": 30, "4": 7},
    "progression": {
        "min_inliers": 25,
        "worsening_length_pct": 10.0,
        "worsening_width_pct": 15.0,
        "worsening_area_pct": 15.0,
        "new_crack_overlap": 0.10,
    },
    "min_crack_area_px": 15,
    "fill_hole_px": 400,              # only enclosed holes up to this area ...
    "fill_hole_thickness_px": 3,      # ... AND at most this thick (thin slivers) are filled
    "low_confidence": 0.5,
}


def load_config(path: Optional[str] = None, overrides: Optional[dict] = None) -> dict:
    """Return DEFAULT_CONFIG deep-merged with a JSON file and/or a dict."""
    cfg = copy.deepcopy(DEFAULT_CONFIG)

    def merge(a, b):
        for k, v in b.items():
            if isinstance(v, dict) and isinstance(a.get(k), dict):
                merge(a[k], v)
            else:
                a[k] = v

    if path:
        with open(path, "r", encoding="utf-8") as f:
            merge(cfg, json.load(f))
    if overrides:
        merge(cfg, overrides)
    return cfg