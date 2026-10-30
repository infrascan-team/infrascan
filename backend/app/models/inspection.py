import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, JSON
from app.db.session import Base

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(String, primary_key=True, index=True)
    asset_id = Column(String, nullable=False, index=True)
    asset_name = Column(String, nullable=False)
    asset_type = Column(String, default="Bridge")
    title = Column(String, nullable=False)
    inspection_type = Column(String, default="Routine")
    inspector_id = Column(String, default="USR-001")
    inspector_name = Column(String, default="Jordan Smith, PE")
    inspector_role = Column(String, default="Lead Inspector")
    date = Column(String, nullable=False)
    status = Column(String, default="Pending Engineer Review")
    overall_severity = Column(String, default="Moderate")
    priority = Column(String, default="Medium")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    images = Column(JSON, default=list)  # list of InspectionImage objects with findings
    findings_count = Column(Integer, default=0)
    engineer_review_status = Column(String, default="Pending")
    engineer_comments = Column(String, nullable=True)
    reviewed_by = Column(String, nullable=True)
    reviewed_at = Column(String, nullable=True)
    preprocessing_stage = Column(String, default="Completed")
    report_generated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
