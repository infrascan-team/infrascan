import os
import shutil
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.config import settings
from app.models.inspection import Inspection
from app.models.asset import Asset
from app.models.report import InspectionReport
from app.schemas.inspection import (
    InspectionResponse,
    InspectionCreate,
    InspectionReviewRequest,
)
from app.services.preprocessing import assess_and_preprocess_image
from app.services.ai_pipeline import run_inspection_ai_pipeline
from app.services.report_generator import generate_pdf_report

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
    item.reviewed_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
    item.status = "Completed" if review_in.review_status == "Approved" else "Pending Engineer Review"

    db.commit()
    db.refresh(item)
    return item

@router.delete("/{inspection_id}")
def delete_inspection(inspection_id: str, db: Session = Depends(get_db)):
    """
    Delete an inspection survey record.
    """
    item = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inspection not found")
    db.delete(item)
    db.commit()
    return {"message": f"Inspection {inspection_id} deleted successfully", "id": inspection_id}

@router.post("/preprocess")
async def preprocess_image_endpoint(
    file: UploadFile = File(...),
):
    """
    Run automated image quality assessment and CLAHE contrast enhancement on uploaded survey photo.
    """
    raw_dir = os.path.join(settings.UPLOAD_DIR, "raw")
    os.makedirs(raw_dir, exist_ok=True)
    file_path = os.path.join(raw_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    prep_dir = os.path.join(settings.UPLOAD_DIR, "preprocessed")
    result = assess_and_preprocess_image(
        image_path=file_path,
        output_dir=prep_dir,
        base_url_prefix="/uploads/preprocessed"
    )
    result["rawUrl"] = f"/uploads/raw/{file.filename}"
    return result

@router.post("/{inspection_id}/analyze")
async def analyze_inspection_image(
    inspection_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload drone/field inspection photo, run automated quality check,
    execute YOLOv11 segmentation inference, extract geometric crack measurements,
    and generate Explainable AI attention heatmaps and masks.
    """
    raw_dir = os.path.join(settings.UPLOAD_DIR, "raw")
    os.makedirs(raw_dir, exist_ok=True)
    raw_path = os.path.join(raw_dir, file.filename)
    with open(raw_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Fetch parent inspection & asset metadata
    insp = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    asset_type = "Bridge"
    asset_importance = "High"
    if insp:
        asset_type = insp.asset_type or "Bridge"
        if insp.asset_id:
            asset = db.query(Asset).filter(Asset.id == insp.asset_id).first()
            if asset and asset.importance:
                asset_importance = asset.importance

    # Execute end-to-end AI Computer Vision Pipeline
    ai_result = run_inspection_ai_pipeline(
        image_path=raw_path,
        inspection_id=inspection_id,
        infrastructure_type=asset_type,
        asset_importance=asset_importance,
        confidence_threshold=0.04,
        output_dir=os.path.join(settings.UPLOAD_DIR, "inspections"),
        url_prefix="/uploads/inspections",
    )

    image_record = ai_result["image"]
    findings = ai_result["findings"]

    # Persist analysis results into Database
    if insp:
        current_images = list(insp.images or [])
        # If there are placeholder images from wizard initialization, replace with the real analyzed record
        replaced = False
        for idx, existing_img in enumerate(current_images):
            if existing_img.get("filename") == file.filename or len(existing_img.get("findings", [])) == 0:
                current_images[idx] = image_record
                replaced = True
                break
        if not replaced:
            current_images = [image_record] + current_images

        insp.images = current_images
        insp.findings_count = sum(len(img.get("findings", [])) for img in current_images)
        insp.overall_severity = ai_result["overallSeverity"]
        insp.priority = ai_result["priority"].split(" ")[0] if " " in ai_result["priority"] else ai_result["priority"]
        insp.status = "Pending Engineer Review"
        insp.preprocessing_stage = "Completed"
        insp.report_generated = True

        # Update parent asset's defect counters
        if insp.asset_id:
            asset = db.query(Asset).filter(Asset.id == insp.asset_id).first()
            if asset:
                asset.open_findings_count = (asset.open_findings_count or 0) + len(findings)
                if ai_result["overallSeverity"] in ["Severe", "Critical"]:
                    asset.condition_status = "Poor" if ai_result["overallSeverity"] == "Severe" else "Critical"
                asset.last_inspection_date = str(insp.date or datetime.date.today().isoformat())

        # Auto-compile inspection audit report
        rpt = db.query(InspectionReport).filter(InspectionReport.inspection_id == insp.id).first()
        suffix = insp.id.split('-')[-1] if '-' in insp.id else insp.id
        rpt_id = rpt.id if rpt else f"RPT-{datetime.date.today().year}-{suffix}"
        
        all_findings = []
        for img in current_images:
            all_findings.extend(img.get("findings", []))
        total_f = len(all_findings) or len(findings) or 1
        sev = ai_result["overallSeverity"] or "Moderate"
        
        rpt_payload = {
            "id": rpt_id,
            "inspection_id": insp.id,
            "asset_id": insp.asset_id or "AST-BRG-0048",
            "asset_name": insp.asset_name or "Civil Infrastructure Asset",
            "asset_type": insp.asset_type or "Bridge",
            "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "generated_by": insp.inspector_name or "Elena Rostova, SE",
            "severity": sev,
            "findings_summary": {
                "total": total_f,
                "critical": sum(1 for f in all_findings if f.get("severity") == "Critical"),
                "severe": sum(1 for f in all_findings if f.get("severity") == "Severe"),
                "moderate": sum(1 for f in all_findings if f.get("severity") == "Moderate") or (1 if sev == "Moderate" else 0),
                "minor": sum(1 for f in all_findings if f.get("severity") == "Minor"),
            },
            "recommendations": "Automated civil engineering defect report compiled via YOLOv11 crack segmentation. Structural monitoring and resin injection advised.",
            "model_version": "YOLOv11-CrackSeg v2.4.1",
        }
        pdf_url = None
        try:
            pdf_url = generate_pdf_report(rpt_payload)
        except Exception as e:
            print(f"Could not generate PDF: {e}")

        if not rpt:
            rpt = InspectionReport(
                id=rpt_id,
                inspection_id=insp.id,
                asset_id=rpt_payload["asset_id"],
                asset_name=rpt_payload["asset_name"],
                asset_type=rpt_payload["asset_type"],
                generated_at=rpt_payload["generated_at"],
                generated_by=rpt_payload["generated_by"],
                severity=sev,
                findings_summary=rpt_payload["findings_summary"],
                recommendations=rpt_payload["recommendations"],
                model_version="YOLOv11-CrackSeg v2.4.1",
                file_formats_available=["PDF", "CSV", "JSON"],
                download_url=pdf_url,
            )
            db.add(rpt)
        else:
            rpt.findings_summary = rpt_payload["findings_summary"]
            rpt.severity = sev
            if pdf_url:
                rpt.download_url = pdf_url

        db.commit()
        db.refresh(insp)

    return {
        "inspectionId": inspection_id,
        "image": image_record,
        "findings": findings,
        "overallSeverity": ai_result["overallSeverity"],
        "priority": ai_result["priority"],
        "geometrySummary": ai_result["geometrySummary"],
        "recommendedActions": ai_result["recommendedActions"],
        "status": "Inference Complete",
    }
