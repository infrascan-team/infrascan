"""Small helpers to load masks/images and save results."""
from __future__ import annotations

import json
from typing import Optional

import cv2
import numpy as np


def load_mask(path: str, threshold: int = 127) -> np.ndarray:
    m = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
    if m is None:
        raise FileNotFoundError(f"Cannot read mask: {path}")
    return ((m > threshold) * 255).astype(np.uint8)


def load_image(path: str) -> np.ndarray:
    im = cv2.imread(path, cv2.IMREAD_COLOR)
    if im is None:
        raise FileNotFoundError(f"Cannot read image: {path}")
    return im


def load_mask_bytes(data: bytes, threshold: int = 127) -> np.ndarray:
    m = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_GRAYSCALE)
    if m is None:
        raise ValueError("Mask is not a valid image.")
    return ((m > threshold) * 255).astype(np.uint8)


def save_json(obj: dict, path: str) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2)


def parse_scale(ref_mm: Optional[float], ref_px: Optional[float]):
    from .schemas import Scale
    if ref_mm and ref_px:
        return Scale.from_reference(ref_mm, ref_px)
    return None
