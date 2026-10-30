from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.model_version import ModelVersion
from app.schemas.model_version import ModelVersionResponse

router = APIRouter()

@router.get("", response_model=List[ModelVersionResponse])
def get_models(db: Session = Depends(get_db)):
    """
    Retrieve registered AI crack detection and segmentation model versions and benchmarks.
    """
    return db.query(ModelVersion).all()
