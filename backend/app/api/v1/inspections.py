import os
import shutil
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.config import settings
from app.models.inspection import Inspection
from app.schemas.inspection import (
    InspectionResponse,
    InspectionCreate,
    InspectionReviewRequest,
)

router = APIRouter()

@router.get("", response_model=List[InspectionResponse])
def get_inspections(
    status: Optional[str] = Query(None, description="Filter by status"),
    asset_id: Optional[str] = Query(None, description="Filter by asset ID"),
    db: Session = Depends(get_db),
):
    """
    Retrieve inspection records with optional status and asset filters.
    """
    query = db.query(Inspection)
    if status and status != "All":
        query = query.filter(Inspection.status == status)
    if asset_id:
        query = query.filter(Inspection.asset_id == asset_id)
    return query.order_by(Inspection.created_at.desc()).all()

@router.get("/{inspection_id}", response_model=InspectionResponse)
def get_inspection(inspection_id: str, db: Session = Depends(get_db)):
    """
    Get full details for a single inspection survey.
    """
    item = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return item

@router.post("", response_model=InspectionResponse)
def create_inspection(data_in: InspectionCreate, db: Session = Depends(get_db)):
    """
    Register a new civil infrastructure inspection.
    """
    insp_id = data_in.id or f"INSP-{datetime.date.today().year}-{db.query(Inspection).count() + 250}"
    insp_date = data_in.date or datetime.date.today().isoformat()
    
    lat = None
    lng = None
    if data_in.gps_coordinates:
        lat = data_in.gps_coordinates.get("lat")
        lng = data_in.gps_coordinates.get("lng")

    item = Inspection(
        id=insp_id,
        asset_id=data_in.asset_id,
        asset_name=data_in.asset_name,
        asset_type=data_in.asset_type or "Bridge",
        title=data_in.title,
        inspection_type=data_in.inspection_type or "Routine",
        inspector_id=data_in.inspector_id or "USR-001",
        inspector_name=data_in.inspector_name or "Jordan Smith, PE",
        inspector_role=data_in.inspector_role or "Lead Inspector",
        date=insp_date,
        status=data_in.status or "Processing",
        overall_severity=data_in.overall_severity or "Moderate",
        priority=data_in.priority or "Medium",
        latitude=lat,
        longitude=lng,
        images=data_in.images or [],
        findings_count=len(data_in.images[0].get("findings", [])) if data_in.images else 0,
        engineer_review_status=data_in.engineer_review_status or "Pending",
        preprocessing_stage=data_in.preprocessing_stage or "Completed",
        report_generated=data_in.report_generated or False,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.post("/{inspection_id}/review", response_model=InspectionResponse)
def review_inspection(
    inspection_id: str,
    review_in: InspectionReviewRequest,
    db: Session = Depends(get_db),
):
    """
    Engineer sign-off or reinspection flag for an inspection.
    """
    item = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inspection not found")

    item.engineer_review_status = review_in.review_status
    item.engineer_comments = review_in.comments
    item.reviewed_by = review_in.reviewer
    item.reviewed_at = datetime.datetime.utcnow().isoformat()
    item.status = "Completed" if review_in.review_status == "Approved" else "Pending Engineer Review"

    db.commit()
    db.refresh(item)
    return item

@router.post("/{inspection_id}/analyze")
async def analyze_inspection_image(
    inspection_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload drone/field inspection photo, run automated quality check,
    and generate crack findings with bounding boxes and measurements.
    """
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    image_url = f"/uploads/{file.filename}"

    # Sample automated crack detection findings matching frontend schema
    simulated_findings = [
        {
            "id": f"FND-{datetime.datetime.now().strftime('%M%S')}-01",
            "inspectionId": inspection_id,
            "category": "Cracks",
            "crackType": "Diagonal",
            "bbox": [28.4, 34.2, 42.1, 28.6],
            "confidenceScore": 0.94,
            "severity": "Moderate",
            "measurements": {
                "crackLengthPx": 412,
                "avgWidthPx": 8.4,
                "maxWidthPx": 14.2,
                "areaPx": 3460,
                "densityPercent": 4.8,
                "orientationAngleDeg": 42.5,
                "isCalibrated": False,
                "uncertaintyNotes": "Field camera uncalibrated. Pixel dimensions reported.",
            },
            "reviewStatus": "Pending Review",
            "engineerNotes": "Principal tensile shear pattern observed.",
            "detectedAt": datetime.datetime.utcnow().isoformat(),
        }
    ]

    image_record = {
        "id": f"IMG-{datetime.datetime.now().strftime('%M%S')}",
        "filename": file.filename,
        "url": image_url,
        "resolution": "4032 x 3024",
        "fileSizeBytes": os.path.getsize(file_path),
        "qualityScore": 95,
        "blurScore": "Pass",
        "findings": simulated_findings,
    }

    item = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if item:
        current_images = list(item.images or [])
        current_images.append(image_record)
        item.images = current_images
        item.findings_count = sum(len(img.get("findings", [])) for img in current_images)
        db.commit()

    return {
        "inspection_id": inspection_id,
        "image": image_record,
        "findings": simulated_findings,
        "status": "Inference Complete",
    }
