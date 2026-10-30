"""Maintenance prioritisation & alerts (spec sections 16 and 20)."""
from __future__ import annotations

from typing import Optional

from .config import ALERT_LEVELS, PRIORITY_LEVELS, DEFAULT_CONFIG
from .schemas import PriorityResult, ProgressionResult, SeverityResult

ACTIONS = {
    0: ["Continue routine inspection schedule."],
    1: ["Log finding; re-inspect at next scheduled cycle."],
    2: ["Schedule follow-up inspection.", "Raise minor repair task (sealing/patching)."],
    3: ["Assign maintenance work order.", "Engineer review of AI findings.",
        "Shorten inspection interval."],
    4: ["Escalate for urgent qualified engineering review.",
        "Any access restriction is the engineer's decision, not the system's."],
}


def prioritize(severity: SeverityResult,
               progression: Optional[ProgressionResult] = None,
               infrastructure_type: str = "building",
               asset_importance: str = "medium",
               engineer_risk_bump: int = 0,
               config: Optional[dict] = None) -> PriorityResult:
    cfg = config or DEFAULT_CONFIG
    why = [f"Base from severity '{severity.label}' -> level {severity.level}"]
    lvl = severity.level

    if cfg["asset_importance"].get(asset_importance, 1) >= 2 and lvl >= 2:
        lvl += 1
        why.append(f"Asset importance '{asset_importance}' -> +1")
    if infrastructure_type.lower() in cfg["structural_types"] and lvl >= 2:
        lvl += 1
        why.append(f"Structure type '{infrastructure_type}' (safety-critical) -> +1")
    if progression and progression.trend == "worsening":
        lvl += 1
        why.append(f"Damage progressing (length {progression.length_change_pct:+.0f}%, "
                   f"new cracks {progression.new_cracks}) -> +1")
    if engineer_risk_bump:
        lvl += engineer_risk_bump
        why.append(f"Engineer-defined risk factor -> {engineer_risk_bump:+d}")
    if severity.level == 0 and not (progression and progression.trend == "worsening"):
        lvl = 0
    lvl = max(0, min(lvl, 4))

    actions = list(ACTIONS[lvl])
    if severity.confidence < cfg["low_confidence"]:
        actions.append("Low model confidence: capture better/calibrated images and re-run.")
    return PriorityResult(
        priority_level=lvl, priority=PRIORITY_LEVELS[lvl], alert_level=ALERT_LEVELS[lvl],
        follow_up_days=cfg["follow_up_days"][str(lvl)],
        recommended_actions=actions, rationale=why)
