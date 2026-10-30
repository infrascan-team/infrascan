from sqlalchemy import Column, String, JSON
from app.db.session import Base

class InspectionReport(Base):
    __tablename__ = "inspection_reports"

    id = Column(String, primary_key=True, index=True)
    inspection_id = Column(String, nullable=False, index=True)
    asset_id = Column(String, nullable=False)
    asset_name = Column(String, nullable=False)
    asset_type = Column(String, default="Bridge")
    generated_at = Column(String, nullable=False)
    generated_by = Column(String, nullable=False)
    severity = Column(String, default="Moderate")
    findings_summary = Column(JSON, default=dict)
    recommendations = Column(String, default="")
    model_version = Column(String, default="v2.4.1")
    file_formats_available = Column(JSON, default=list)
    download_url = Column(String, nullable=True)
