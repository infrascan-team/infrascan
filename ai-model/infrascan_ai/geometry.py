"""Crack geometry & measurement (spec section 9)."""
from __future__ import annotations

import math
from typing import Optional

import cv2
import numpy as np
from skimage.morphology import skeletonize

from .config import DEFAULT_CONFIG
from .schemas import CrackMeasurement, GeometryResult, Scale


def _neighbor_count(skel: np.ndarray) -> np.ndarray:
    k = np.ones((3, 3), np.uint8)
    k[1, 1] = 0
    return cv2.filter2D(skel.astype(np.uint8), -1, k, borderType=cv2.BORDER_CONSTANT)


def skeleton_length(skel: np.ndarray) -> float:
    """
    Length of an 8-connected skeleton: 1 per orthogonal link, sqrt(2) per diagonal link.
    Diagonal links that merely short-cut an L-shaped corner are dropped to avoid
    double counting.
    """
    s = skel.astype(bool)
    h = np.logical_and(s[:, :-1], s[:, 1:]).sum()
    v = np.logical_and(s[:-1, :], s[1:, :]).sum()
    # "\" diagonal (y,x)-(y+1,x+1) is redundant if (y,x+1) or (y+1,x) is set
    d1 = (s[:-1, :-1] & s[1:, 1:]) & ~(s[:-1, 1:] | s[1:, :-1])
    # "/" diagonal (y,x+1)-(y+1,x) is redundant if (y,x) or (y+1,x+1) is set
    d2 = (s[:-1, 1:] & s[1:, :-1]) & ~(s[:-1, :-1] | s[1:, 1:])
    return float(h + v + math.sqrt(2) * (int(d1.sum()) + int(d2.sum())))


def principal_angle(points_xy: np.ndarray) -> float:
    """Principal-axis angle in degrees [0,180); 0 = horizontal, 90 = vertical."""
    if len(points_xy) < 2:
        return 0.0
    pts = points_xy.astype(np.float64)
    pts -= pts.mean(0)
    vals, vecs = np.linalg.eigh(np.cov(pts.T))
    vx, vy = vecs[:, np.argmax(vals)]
    return float(math.degrees(math.atan2(-vy, vx)) % 180)


def orientation_label(angle: float, branch_points: int, bbox) -> str:
    w, h = bbox[2], bbox[3]
    if branch_points >= 4 and 0.5 < (w / max(h, 1)) < 2.0:
        return "map/alligator-like"
    if angle < 15 or angle >= 165:
        return "horizontal/transverse"
    if 75 <= angle <= 105:
        return "vertical/longitudinal"
    return "diagonal"


def fill_small_holes(m: np.ndarray, max_area: int, max_thickness: int = 3) -> np.ndarray:
    """
    Fill THIN background slivers enclosed by the mask. A hole is filled only when it is both
    small (area <= max_area) and thin (about <= max_thickness px across). Thin slits are
    segmentation artefacts that turn into fake loops / double-counted length / fake branch
    points; wider enclosed gaps are real structure and are kept.
    """
    if max_area <= 0 or max_thickness <= 0:
        return m
    inv = (m == 0).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(inv, connectivity=4)
    dt = cv2.distanceTransform(inv, cv2.DIST_L2, 5)     # distance to the nearest crack pixel
    out = m.copy()
    h, w = m.shape
    for i in range(1, n):
        x, y, bw, bh, area = (int(v) for v in st[i])
        if x == 0 or y == 0 or x + bw == w or y + bh == h or area > max_area:
            continue                                   # touches the border (= background) or too big
        thickness = 2.0 * float(dt[lab == i].max()) - 1.0
        if thickness <= max_thickness:
            out[lab == i] = 1
    return out


def junction_count(skel: np.ndarray) -> int:
    """
    Number of true branch junctions on a thin skeleton. A pixel is a junction when its 8
    neighbours (read in a circle) switch from empty to filled 3+ times (crossing number);
    adjacent junction pixels are merged into one junction. Staircase corners and clusters of
    pixels at one junction are therefore NOT counted as extra branches.
    """
    s = skel.astype(np.uint8)
    p = np.pad(s, 1)
    n = [p[:-2, 1:-1], p[:-2, 2:], p[1:-1, 2:], p[2:, 2:],
         p[2:, 1:-1], p[2:, :-2], p[1:-1, :-2], p[:-2, :-2]]
    trans = sum(((n[i] == 0) & (n[(i + 1) % 8] == 1)).astype(np.int32) for i in range(8))
    j = ((s == 1) & (trans >= 3)).astype(np.uint8)
    return int(cv2.connectedComponents(j, connectivity=8)[0] - 1)


def measure_cracks(mask: np.ndarray,
                   scale: Optional[Scale] = None,
                   surface_mask: Optional[np.ndarray] = None,
                   min_area_px: Optional[int] = None,
                   max_hole_px: Optional[int] = None,
                   hole_thickness_px: Optional[int] = None) -> GeometryResult:
    """
    mask         : HxW array, >0 = crack pixel
    scale        : Scale for mm output. None -> pixels only (spec: don't fake mm).
    surface_mask : optional ROI of the inspected surface (defaults to the whole image)
    """
    min_area_px = DEFAULT_CONFIG["min_crack_area_px"] if min_area_px is None else min_area_px
    max_hole_px = DEFAULT_CONFIG["fill_hole_px"] if max_hole_px is None else max_hole_px
    hole_thickness_px = DEFAULT_CONFIG["fill_hole_thickness_px"] if hole_thickness_px is None else hole_thickness_px
    m = fill_small_holes((mask > 0).astype(np.uint8), max_hole_px, hole_thickness_px)
    n, labels, stats, _ = cv2.connectedComponentsWithStats(m, connectivity=8)
    skel_full = skeletonize(m.astype(bool))
    dist = cv2.distanceTransform(m, cv2.DIST_L2, 5)
    surface_area = int((surface_mask > 0).sum()) if surface_mask is not None else int(m.size)

    cracks, k = [], 0
    comp_label = {}                      # crack_id -> connected-component label
    for i in range(1, n):
        area = int(stats[i, cv2.CC_STAT_AREA])
        if area < min_area_px:
            continue
        skel = skel_full & (labels == i)
        if not skel.any():
            continue
        k += 1
        comp_label[k] = i
        length = skeleton_length(skel)
        # distance transform measures to the nearest background pixel *centre*, so a band of
        # w pixels gives dist=(w+1)/2 on its centreline -> w = 2*dist - 1 (clip at 1px)
        widths = np.maximum(2.0 * dist[skel] - 1.0, 1.0)
        nb = _neighbor_count(skel) * skel
        ys, xs = np.nonzero(skel)
        ang = principal_angle(np.column_stack([xs, ys]))
        bbox = (int(stats[i, 0]), int(stats[i, 1]), int(stats[i, 2]), int(stats[i, 3]))
        branch = junction_count(skel)
        cm = CrackMeasurement(
            crack_id=k, length_px=length, avg_width_px=float(widths.mean()),
            max_width_px=float(widths.max()), area_px=area, orientation_deg=ang,
            orientation_label=orientation_label(ang, branch, bbox),
            branch_points=branch, end_points=int((nb == 1).sum()), bbox=bbox,
            width_p95_px=float(np.percentile(widths, 95)))
        if scale:
            s = scale.mm_per_pixel
            cm.length_mm = length * s
            cm.avg_width_mm = cm.avg_width_px * s
            cm.max_width_mm = cm.max_width_px * s
            # scale uncertainty combined with +-1px quantisation on the width
            cm.width_uncertainty_mm = math.sqrt(
                (cm.max_width_mm * scale.uncertainty_pct / 100) ** 2 + s ** 2)
        cracks.append(cm)

    total_area = int(sum(c.area_px for c in cracks))
    res = GeometryResult(
        cracks=cracks,
        total_crack_area_px=total_area,
        surface_area_px=surface_area,
        crack_density_pct=100.0 * total_area / max(surface_area, 1),   # spec formula
        total_length_px=float(sum(c.length_px for c in cracks)),
        max_width_px=float(max((c.max_width_px for c in cracks), default=0.0)),
        calibrated=scale is not None,
        unit="mm" if scale else "px",
        width_p95_px=float(max((c.width_p95_px for c in cracks), default=0.0)),
        skeleton=skel_full, labels=labels, comp_label=comp_label)
    return res