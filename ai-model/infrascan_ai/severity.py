"""Damage severity assessment (spec section 10): weighted scoring + rule overrides."""
from __future__ import annotations

from typing import Optional

from .config import SEVERITY_LEVELS, DEFAULT_CONFIG
from .schemas import GeometryResult, Scale, SeverityResult
from .utils import lookup


def assess_severity(geom: GeometryResult,
                    image_shape: tuple,
                    scale: Optional[Scale] = None,
                    damage_types: Optional[list] = None,
                    damage_area_pct: float = 0.0,
                    model_confidence: float = 1.0,
                    config: Optional[dict] = None) -> SeverityResult:
    cfg = config or DEFAULT_CONFIG
    th, w = cfg["thresholds"], cfg["weights"]
    H, W = image_shape[:2]
    why = []

    if not geom.cracks and not damage_types:
        return SeverityResult(0, SEVERITY_LEVELS[0], 0.0, model_confidence,
                              ["No crack or surface damage detected."], False)

    # --- width (robust: 95th percentile along the crack, so one blob at a junction or a
    #     single noisy pixel cannot decide the severity; the plain maximum is still reported)
    if geom.calibrated and scale:
        w_mm = geom.width_p95_px * scale.mm_per_pixel
        s_width = lookup(w_mm, th["width_mm"])
        why.append(f"Crack width (95th percentile) {w_mm:.2f} mm, max "
                   f"{geom.max_width_px * scale.mm_per_pixel:.2f} mm -> width score {s_width}/4")
    else:
        rel = 100.0 * geom.width_p95_px / min(H, W)
        s_width = lookup(rel, th["rel_width_pct"])
        why.append(f"No scale calibration: crack width (95th percentile) {geom.width_p95_px:.1f}px, "
                   f"max {geom.max_width_px:.1f}px ({rel:.2f}% of image) -> width score "
                   f"{s_width}/4 (pixel-space estimate)")

    # --- density / length / branching -------------------------------------
    s_density = lookup(geom.crack_density_pct, th["density_pct"])
    why.append(f"Crack density {geom.crack_density_pct:.2f}% -> density score {s_density}/4")

    ld = 1000.0 * geom.total_length_px / (H * W)
    s_len = lookup(ld, th["length_density"])
    why.append(f"Crack length density {ld:.2f} -> length score {s_len}/4")

    branches = sum(c.branch_points for c in geom.cracks)
    s_branch = min(4, branches // 3)
    why.append(f"{branches} branch points across {len(geom.cracks)} crack(s) "
               f"-> branching score {s_branch}/4")

    # --- damage type -------------------------------------------------------
    s_type = 0
    for t in (damage_types or []):
        s_type = max(s_type, cfg["damage_type_score"].get(t, 2))
    if damage_area_pct > 5:
        s_type = min(4, s_type + 1)
    if damage_types:
        why.append(f"Damage types {damage_types} (area {damage_area_pct:.1f}%) "
                   f"-> type score {s_type}/4")

    score = (w["width"] * s_width + w["density"] * s_density + w["length"] * s_len +
             w["branching"] * s_branch + w["damage_type"] * s_type)

    # --- rule overrides: one severe factor can't be averaged away ----------
    level = int(round(score))
    if max(s_width, s_type) == 4:
        level = max(level, 3)
        why.append("Rule: critical width/damage-type factor -> severity floor 'Severe'")
    if s_width >= 3 and s_density >= 3:
        level = max(level, 3)
        why.append("Rule: wide cracks with high density -> severity floor 'Severe'")
    level = min(level, 4)

    conf = model_confidence * (1.0 if geom.calibrated else 0.8)
    if geom.total_crack_area_px < 50:
        conf *= 0.8
    return SeverityResult(level, SEVERITY_LEVELS[level], round(score, 3), round(conf, 3),
                          why, needs_engineer_review=level >= 3 or conf < cfg["low_confidence"])