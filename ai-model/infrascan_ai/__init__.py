"""InfraScan post-CV AI layer: geometry -> severity -> priority -> progression."""
from .config import SEVERITY_LEVELS, PRIORITY_LEVELS, ALERT_LEVELS, load_config
from .schemas import (Scale, CrackMeasurement, GeometryResult, SeverityResult,
                      ProgressionResult, PriorityResult)
from .geometry import measure_cracks
from .severity import assess_severity
from .progression import compare_inspections
from .priority import prioritize
from .pipeline import analyze
from .visualization import overlay, progression_overlay
from .yolo_bridge import analyze_image, load_model, result_to_mask, predict_mask

__version__ = "1.0.0"
__all__ = [
    "Scale", "CrackMeasurement", "GeometryResult", "SeverityResult", "ProgressionResult",
    "PriorityResult", "measure_cracks", "assess_severity", "compare_inspections",
    "prioritize", "analyze", "overlay", "progression_overlay", "load_config",
    "analyze_image", "load_model", "result_to_mask", "predict_mask",
    "SEVERITY_LEVELS", "PRIORITY_LEVELS", "ALERT_LEVELS",
]
