from typing import Optional
from app.schemas.base import CamelModel

class AssetBase(CamelModel):
    name: str
    type: str  # Bridge, Tunnel, Road, Dam, Building, etc.
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    construction_year: Optional[int] = 2010
    material_type: Optional[str] = "Reinforced Concrete"
    responsible_department: Optional[str] = "Civil Infrastructure Division"
    inspection_frequency_months: Optional[int] = 6
    importance: Optional[str] = "Standard"
    condition_status: Optional[str] = "Good"
    last_inspection_date: Optional[str] = None
    next_scheduled_inspection: Optional[str] = None
    open_findings_count: Optional[int] = 0
    maintenance_history_count: Optional[int] = 0
    notes: Optional[str] = ""
    image_url: Optional[str] = None

class AssetCreate(AssetBase):
    id: Optional[str] = None

class AssetUpdate(CamelModel):
    name: Optional[str] = None
    type: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    construction_year: Optional[int] = None
    material_type: Optional[str] = None
    responsible_department: Optional[str] = None
    inspection_frequency_months: Optional[int] = None
    importance: Optional[str] = None
    condition_status: Optional[str] = None
    last_inspection_date: Optional[str] = None
    next_scheduled_inspection: Optional[str] = None
    open_findings_count: Optional[int] = None
    maintenance_history_count: Optional[int] = None
    notes: Optional[str] = None
    image_url: Optional[str] = None

class AssetResponse(AssetBase):
    id: str
