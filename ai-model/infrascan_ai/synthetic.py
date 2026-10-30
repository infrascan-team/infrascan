"""Synthetic crack masks/images for demos and tests (no trained model needed)."""
from __future__ import annotations

import cv2
import numpy as np


def make_mask(width_px: int = 3, extra: bool = False, shape=(480, 640)) -> np.ndarray:
    m = np.zeros(shape, np.uint8)
    pts = np.array([[40, 100], [180, 140], [300, 120], [450, 200], [600, 230]], np.int32)
    cv2.polylines(m, [pts], False, 255, width_px)
    cv2.polylines(m, [np.array([[300, 120], [330, 220], [320, 330]], np.int32)],
                  False, 255, max(1, width_px - 1))
    if extra:
        cv2.polylines(m, [np.array([[100, 400], [260, 360], [380, 420]], np.int32)],
                      False, 255, width_px)
    return m


def make_textured_image(shape=(480, 640), seed: int = 0) -> np.ndarray:
    """Noisy concrete-like texture so ORB has features to register on."""
    rng = np.random.default_rng(seed)
    base = rng.normal(150, 25, shape).astype(np.float32)
    base = cv2.GaussianBlur(base, (0, 0), 1.2)
    img = np.clip(base, 0, 255).astype(np.uint8)
    for _ in range(250):                                # blobs/pits = trackable features
        x, y = int(rng.integers(0, shape[1])), int(rng.integers(0, shape[0]))
        cv2.circle(img, (x, y), int(rng.integers(2, 6)), int(rng.integers(60, 230)), -1)
    return cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
