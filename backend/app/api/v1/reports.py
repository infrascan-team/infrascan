import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.report import InspectionReport
from app.schemas.report import (
    InspectionReportResponse,
    InspectionReportCreate,
)

router = APIRouter()

@router.get("", response_model=List[InspectionReportResponse])
def get_reports(db: Session = Depends(get_db)):
    """
    Retrieve all generated civil engineering inspection audit reports.
    """
    return db.query(InspectionReport).all()

@router.get("/{report_id}", response_model=InspectionReportResponse)
def get_report(report_id: str, db: Session = Depends(get_db)):
    """
    Get detailed audit report by ID.
    """
    item = db.query(InspectionReport).filter(InspectionReport.id == report_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Report not found")
    return item

@router.post("/generate", response_model=InspectionReportResponse)
def generate_report(data_in: InspectionReportCreate, db: Session = Depends(get_db)):
    """
    Compile and issue a formal civil engineering inspection report.
    """
    rpt_id = data_in.id or f"RPT-{datetime.date.today().year}-{db.query(InspectionReport).count() + 101}"
    gen_time = data_in.generated_at or datetime.datetime.utcnow().isoformat()

    item = InspectionReport(
        id=rpt_id,
        inspection_id=data_in.inspection_id,
        asset_id=data_in.asset_id,
        asset_name=data_in.asset_name,
        asset_type=data_in.asset_type or "Bridge",
        generated_at=gen_time,
        generated_by=data_in.generated_by,
        severity=data_in.severity or "Moderate",
        findings_summary=data_in.findings_summary or {},
        recommendations=data_in.recommendations or "",
        model_version=data_in.model_version or "v2.4.1",
        file_formats_available=data_in.file_formats_available or ["PDF", "CSV", "JSON"],
        download_url=data_in.download_url,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
