"""Damage progression & historical analysis (spec section 15)."""
from __future__ import annotations

from typing import Optional

import cv2
import numpy as np

from .config import DEFAULT_CONFIG
from .geometry import measure_cracks
from .schemas import ProgressionResult, Scale
from .utils import pct_change


def register(prev_img: np.ndarray, cur_img: np.ndarray):
    """ORB + RANSAC homography mapping prev -> cur. Returns (H or None, n_inliers)."""
    g1 = cv2.cvtColor(prev_img, cv2.COLOR_BGR2GRAY) if prev_img.ndim == 3 else prev_img
    g2 = cv2.cvtColor(cur_img, cv2.COLOR_BGR2GRAY) if cur_img.ndim == 3 else cur_img
    orb = cv2.ORB_create(4000)
    k1, d1 = orb.detectAndCompute(g1, None)
    k2, d2 = orb.detectAndCompute(g2, None)
    if d1 is None or d2 is None or len(k1) < 12 or len(k2) < 12:
        return None, 0
    matches = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True).match(d1, d2)
    matches = sorted(matches, key=lambda m: m.distance)[:300]
    if len(matches) < 12:
        return None, 0
    p1 = np.float32([k1[m.queryIdx].pt for m in matches])
    p2 = np.float32([k2[m.trainIdx].pt for m in matches])
    H, inl = cv2.findHomography(p1, p2, cv2.RANSAC, 4.0)
    return (H, int(inl.sum())) if H is not None else (None, 0)


def compare_inspections(prev_mask: np.ndarray, cur_mask: np.ndarray,
                        prev_img: Optional[np.ndarray] = None,
                        cur_img: Optional[np.ndarray] = None,
                        scale_prev: Optional[Scale] = None,
                        scale_cur: Optional[Scale] = None,
                        config: Optional[dict] = None) -> ProgressionResult:
    """
    Aligns the previous mask to the current viewpoint (when images are given), then
    diffs the geometry. Spec caveat: reliable progression needs comparable viewpoints,
    calibrated scale and image registration - otherwise the trend is 'unreliable'.
    """
    cfg = (config or DEFAULT_CONFIG)["progression"]
    notes, registered, inliers = [], False, 0
    aligned = prev_mask

    if prev_img is not None and cur_img is not None:
        Hm, inliers = register(prev_img, cur_img)
        if Hm is not None and inliers >= cfg["min_inliers"]:
            aligned = cv2.warpPerspective(
                (prev_mask > 0).astype(np.uint8), Hm,
                (cur_mask.shape[1], cur_mask.shape[0]), flags=cv2.INTER_NEAREST)
            registered = True
        else:
            notes.append(f"Registration weak ({inliers} inliers < {cfg['min_inliers']}); "
                         "comparison unreliable.")
    else:
        notes.append("No images supplied for registration; assuming identical viewpoint.")
        registered = prev_mask.shape == cur_mask.shape

    if aligned.shape != cur_mask.shape:
        aligned = cv2.resize(aligned.astype(np.uint8), cur_mask.shape[::-1],
                             interpolation=cv2.INTER_NEAREST)

    gp = measure_cracks(aligned, scale_prev)
    gc = measure_cracks(cur_mask, scale_cur)

    if bool(scale_prev) != bool(scale_cur):
        notes.append("Only one inspection is calibrated; comparing in pixels.")
    if (scale_prev and scale_cur and
            abs(scale_prev.mm_per_pixel - scale_cur.mm_per_pixel) / scale_prev.mm_per_pixel > 0.05):
        notes.append("Different scales between inspections; compare in physical units.")

    # new cracks = current components with little overlap with the (dilated) previous mask
    prev_d = cv2.dilate((aligned > 0).astype(np.uint8), np.ones((9, 9), np.uint8)) > 0
    new = 0
    for c in gc.cracks:
        comp = gc.labels == gc.comp_label[c.crack_id]
        if (comp & prev_d).sum() / max(int(comp.sum()), 1) < cfg["new_crack_overlap"]:
            new += 1

    d_len = pct_change(gp.total_length_px, gc.total_length_px)
    d_w = pct_change(gp.max_width_px, gc.max_width_px)
    d_area = pct_change(gp.total_crack_area_px, gc.total_crack_area_px)
    d_dens = gc.crack_density_pct - gp.crack_density_pct

    if not registered:
        trend = "unreliable"
    elif (new > 0 or d_len > cfg["worsening_length_pct"] or
          d_w > cfg["worsening_width_pct"] or d_area > cfg["worsening_area_pct"]):
        trend = "worsening"
    elif d_len < -10 and d_area < -10:
        trend = "improving"
        notes.append("Cracks shrank; likely repair or model variance, verify manually.")
    else:
        trend = "stable"

    return ProgressionResult(registered, inliers, new, round(d_len, 2), round(d_w, 2),
                             round(d_area, 2), round(d_dens, 3), trend, notes, aligned)
