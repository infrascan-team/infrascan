"""Overlays for the analysis screen / reports (spec sections 12 and 18)."""
from __future__ import annotations

import cv2
import numpy as np

from .schemas import GeometryResult


def overlay(image: np.ndarray, geom: GeometryResult) -> np.ndarray:
    """Mask (red tint), skeleton (yellow), per-crack boxes + id + width label."""
    out = image.copy()
    sel = geom.labels > 0
    out[sel] = (0.5 * out[sel] + 0.5 * np.array([0, 0, 255])).astype(np.uint8)
    out[geom.skeleton] = (0, 255, 255)
    for c in geom.cracks:
        x, y, w, h = c.bbox
        cv2.rectangle(out, (x, y), (x + w, y + h), (0, 255, 0), 1)
        txt = (f"#{c.crack_id} {c.max_width_mm:.2f}mm" if c.max_width_mm is not None
               else f"#{c.crack_id} {c.max_width_px:.1f}px")
        cv2.putText(out, txt, (x, max(y - 4, 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 0), 1)
    return out


def progression_overlay(image: np.ndarray, aligned_prev_mask: np.ndarray,
                        cur_mask: np.ndarray) -> np.ndarray:
    """Blue = previous only (healed/shifted), red = new/grown, white = unchanged."""
    out = image.copy()
    p, c = aligned_prev_mask > 0, cur_mask > 0
    out[p & ~c] = (255, 128, 0)      # BGR blue-ish
    out[c & ~p] = (0, 0, 255)        # red: new / grown
    out[c & p] = (255, 255, 255)
    return out
