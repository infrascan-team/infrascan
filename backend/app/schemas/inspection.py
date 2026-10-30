from typing import List, Optional, Tuple, Any, Dict
from app.schemas.base import CamelModel

class CrackMeasurement(CamelModel):
    crack_length_px: float = 0
    avg_width_px: float = 0
    max_width_px: float = 0
    area_px: float = 0
    density_percent: float = 0
    orientation_angle_deg: float = 0
    is_calibrated: bool = False
    calibrated_scale_mm_per_px: Optional[float] = None
    estimated_length_mm: Optional[float] = None
    estimated_avg_width_mm: Optional[float] = None
    estimated_max_width_mm: Optional[float] = None
    uncertainty_notes: Optional[str] = None

class DamageFinding(CamelModel):
    id: str
    inspection_id: Optional[str] = None
    category: str
    crack_type: Optional[str] = None
    bbox: List[float]  # [x, y, width, height] percentage
    confidence_score: float
    severity: str
    measurements: CrackMeasurement
    review_status: Optional[str] = "Pending Review"
    engineer_notes: Optional[str] = None
    detected_at: Optional[str] = None

class InspectionImage(CamelModel):
    id: str
    filename: str
    url: str
    annotated_url: Optional[str] = None
    mask_url: Optional[str] = None
    heatmap_url: Optional[str] = None
    uploaded_at: Optional[str] = None
    resolution: Optional[str] = "4032 x 3024"
    file_size_bytes: Optional[int] = 4000000
    quality_score: Optional[int] = 95
    blur_score: Optional[str] = "Pass"
    findings: List[DamageFinding] = []

class GpsCoordinates(CamelModel):
    lat: float
    lng: float

class InspectionBase(CamelModel):
    asset_id: str
    asset_name: str
    asset_type: Optional[str] = "Bridge"
    title: str
    inspection_type: Optional[str] = "Routine"
    inspector_id: Optional[str] = "USR-001"
    inspector_name: Optional[str] = "Jordan Smith, PE"
    inspector_role: Optional[str] = "Lead Inspector"
    date: Optional[str] = None
    status: Optional[str] = "Pending Engineer Review"
    overall_severity: Optional[str] = "Moderate"
    priority: Optional[str] = "Medium"
    gps_coordinates: Optional[Dict[str, float]] = None
    images: List[Dict[str, Any]] = []
    findings_count: Optional[int] = 0
    engineer_review_status: Optional[str] = "Pending"
    engineer_comments: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    preprocessing_stage: Optional[str] = "Completed"
    report_generated: Optional[bool] = False

class InspectionCreate(InspectionBase):
    id: Optional[str] = None

class InspectionResponse(InspectionBase):
    id: str

class InspectionReviewRequest(CamelModel):
    review_status: str  # "Approved" | "Requires Reinspection"
    comments: Optional[str] = ""
    reviewer: Optional[str] = "Elena Rostova, SE"
