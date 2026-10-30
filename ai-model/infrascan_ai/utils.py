from __future__ import annotations


def lookup(value: float, table) -> int:
    """Highest-bound-<=-value lookup on a [[bound, score], ...] table."""
    score = 0
    for bound, s in table:
        if value >= bound:
            score = s
    return int(score)


def pct_change(old: float, new: float) -> float:
    if old > 0:
        return 100.0 * (new - old) / old
    return 100.0 if new > 0 else 0.0
