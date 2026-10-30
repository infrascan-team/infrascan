"""
FastAPI router so the backend team can mount this directly:

    from infrascan_ai.api import router
    app.include_router(router, prefix="/ai")

POST /ai/analyze  (multipart): mask file + optional image / prev_mask / prev_image
Requires: fastapi, python-multipart
"""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from . import __version__
from .io_utils import load_mask_bytes, parse_scale
from .pipeline import analyze

router = APIRouter(tags=["infrascan-ai"])


@router.get("/health")
def health():
    return {"status": "ok", "module": "infrascan_ai", "version": __version__}


@router.post("/analyze")
async def analyze_endpoint(
    mask: UploadFile = File(..., description="Binary crack mask from the segmentation model"),
    prev_mask: Optional[UploadFile] = File(None),
    ref_length_mm: Optional[float] = Form(None),
    ref_length_px: Optional[float] = Form(None),
    infrastructure_type: str = Form("building"),
    asset_importance: str = Form("medium"),
    model_confidence: float = Form(1.0),
    damage_types: Optional[str] = Form(None, description="comma-separated, e.g. spalling,corrosion"),
    damage_area_pct: float = Form(0.0),
):
    try:
        m = load_mask_bytes(await mask.read())
        pm = load_mask_bytes(await prev_mask.read()) if prev_mask else None
        scale = parse_scale(ref_length_mm, ref_length_px)
    except (ValueError, FileNotFoundError) as e:
        raise HTTPException(status_code=422, detail=str(e))
    types = [t.strip() for t in damage_types.split(",") if t.strip()] if damage_types else None
    return analyze(m, scale=scale, damage_types=types, damage_area_pct=damage_area_pct,
                   model_confidence=model_confidence, infrastructure_type=infrastructure_type,
                   asset_importance=asset_importance, prev_mask=pm)
