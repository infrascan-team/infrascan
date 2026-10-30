"""Plain dataclasses shared across modules (JSON-friendly via dataclasses.asdict)."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

import numpy as np


@dataclass
class Scale:
    """Pixel -> mm conversion built from a reference object / known dimension."""
    mm_per_pixel: float
    uncertainty_pct: float = 10.0

    @classmethod
    def from_reference(cls, ref_length_mm: float, ref_length_px: float,
                       uncertainty_pct: float = 10.0) -> "Scale":
        if ref_length_px <= 0 or ref_length_mm <= 0:
            raise ValueError("Reference lengths must be positive.")
        return cls(ref_length_mm / ref_length_px, uncertainty_pct)


@dataclass
class CrackMeasurement:
    crack_id: int
    length_px: float
    avg_width_px: float
    max_width_px: float
    area_px: int
    orientation_deg: float            # 0 = horizontal, 90 = vertical, range [0,180)
    orientation_label: str
    branch_points: int
    end_points: int
    bbox: tuple                       # x, y, w, h
    width_p95_px: float = 0.0         # robust width: 95th percentile along the centreline
    length_mm: Optional[float] = None
    avg_width_mm: Optional[float] = None
    max_width_mm: Optional[float] = None
    width_uncertainty_mm: Optional[float] = None


@dataclass
class GeometryResult:
    cracks: list
    total_crack_area_px: int
    surface_area_px: int
    crack_density_pct: float
    total_length_px: float
    max_width_px: float
    calibrated: bool
    unit: str
    width_p95_px: float = 0.0         # largest per-crack robust width
    skeleton: Optional[np.ndarray] = field(default=None, repr=False)
    labels: Optional[np.ndarray] = field(default=None, repr=False)
    comp_label: dict = field(default_factory=dict, repr=False)   # crack_id -> component label


@dataclass
class SeverityResult:
    level: int
    label: str
    score: float                      # continuous 0..4
    confidence: float                 # 0..1
    explanation: list                 # traceable reasons
    needs_engineer_review: bool


@dataclass
class ProgressionResult:
    registered: bool
    alignment_inliers: int
    new_cracks: int
    length_change_pct: float
    width_change_pct: float
    area_change_pct: float
    density_change_pts: float
    trend: str                        # stable | worsening | improving | unreliable
    notes: list
    aligned_prev_mask: Optional[np.ndarray] = field(default=None, repr=False)


@dataclass
class PriorityResult:
    priority_level: int
    priority: str
    alert_level: str
    follow_up_days: int
    recommended_actions: list
    rationale: list
    disclaimer: str = ("AI-assisted visual assessment only. Not a structural safety "
                       "evaluation; qualified engineering review is required for "
                       "Severe/Critical findings.")