from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.asset import Asset
from app.schemas.asset import AssetResponse, AssetCreate

router = APIRouter()

@router.get("", response_model=List[AssetResponse])
def get_assets(
    type: Optional[str] = Query(None, description="Filter by asset type"),
    status: Optional[str] = Query(None, description="Filter by asset status"),
    db: Session = Depends(get_db)
):
    """
    Retrieve infrastructure assets catalog with optional type and status filtering.
    """
    query = db.query(Asset)
    if type and type != "All":
        query = query.filter(Asset.type == type)
    if status and status != "All":
        query = query.filter(Asset.status == status)
    return query.all()

@router.get("/{asset_id}", response_model=AssetResponse)
def get_asset(asset_id: str, db: Session = Depends(get_db)):
    """
    Get detailed information for a single infrastructure asset.
    """
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.post("", response_model=AssetResponse)
def create_asset(asset_in: AssetCreate, db: Session = Depends(get_db)):
    """
    Register a new civil infrastructure asset.
    """
    asset_id = asset_in.id or f"AST-{db.query(Asset).count() + 101}"
    asset = Asset(
        id=asset_id,
        name=asset_in.name,
        type=asset_in.type,
        location=asset_in.location,
        condition_score=asset_in.condition_score or 85,
        status=asset_in.status or "Operational",
        material=asset_in.material or "Reinforced Concrete",
        year_built=asset_in.year_built or 2015,
        latitude=asset_in.latitude,
        longitude=asset_in.longitude
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset
