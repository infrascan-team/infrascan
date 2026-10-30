from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.asset import Asset
from app.schemas.asset import AssetResponse, AssetCreate, AssetUpdate

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
        query = query.filter(Asset.condition_status == status)
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
    asset_id = asset_in.id or f"AST-{asset_in.type[:3].upper()}-{db.query(Asset).count() + 101}"
    asset = Asset(
        id=asset_id,
        name=asset_in.name,
        type=asset_in.type,
        address=asset_in.address,
        latitude=asset_in.latitude,
        longitude=asset_in.longitude,
        construction_year=asset_in.construction_year or 2010,
        material_type=asset_in.material_type or "Reinforced Concrete",
        responsible_department=asset_in.responsible_department or "Civil Infrastructure Division",
        inspection_frequency_months=asset_in.inspection_frequency_months or 6,
        importance=asset_in.importance or "Standard",
        condition_status=asset_in.condition_status or "Good",
        last_inspection_date=asset_in.last_inspection_date,
        next_scheduled_inspection=asset_in.next_scheduled_inspection,
        open_findings_count=asset_in.open_findings_count or 0,
        maintenance_history_count=asset_in.maintenance_history_count or 0,
        notes=asset_in.notes or "",
        image_url=asset_in.image_url,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset

@router.patch("/{asset_id}", response_model=AssetResponse)
def update_asset(asset_id: str, updates: AssetUpdate, db: Session = Depends(get_db)):
    """
    Update fields of an existing civil infrastructure asset.
    """
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(asset, field, value)

    db.commit()
    db.refresh(asset)
    return asset
