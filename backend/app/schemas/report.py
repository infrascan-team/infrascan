from typing import List, Dict, Any, Optional
from app.schemas.base import CamelModel

class FindingsSummary(CamelModel):
    total: int
    critical: int
    severe: int
    moderate: int
    minor: int

class InspectionReportBase(CamelModel):
    inspection_id: str
    asset_id: str
    asset_name: str
    asset_type: Optional[str] = "Bridge"
    generated_by: str
    severity: Optional[str] = "Moderate"
    findings_summary: Dict[str, Any]
    recommendations: Optional[str] = ""
    model_version: Optional[str] = "v2.4.1"
    file_formats_available: Optional[List[str]] = ["PDF", "CSV", "JSON"]
    download_url: Optional[str] = None

class InspectionReportCreate(InspectionReportBase):
    id: Optional[str] = None
    generated_at: Optional[str] = None

class InspectionReportResponse(InspectionReportBase):
    id: str
    generated_at: str
