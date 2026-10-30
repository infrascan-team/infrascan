from typing import Optional
from app.schemas.base import CamelModel

class MaintenanceWorkOrderBase(CamelModel):
    title: str
    asset_id: str
    asset_name: str
    inspection_id: str
    finding_id: Optional[str] = None
    priority: Optional[str] = "Medium Priority"
    status: Optional[str] = "Open"
    assigned_team: Optional[str] = "Bridge Maintenance Crew A"
    assigned_engineer: Optional[str] = "Sarah Lin"
    due_date: str
    completed_at: Optional[str] = None
    repair_recommendations: Optional[str] = ""
    completion_notes: Optional[str] = None
    follow_up_inspection_required: Optional[bool] = True

class MaintenanceWorkOrderCreate(MaintenanceWorkOrderBase):
    id: Optional[str] = None
    created_at: Optional[str] = None

class MaintenanceWorkOrderStatusUpdate(CamelModel):
    status: str
    notes: Optional[str] = None

class MaintenanceWorkOrderResponse(MaintenanceWorkOrderBase):
    id: str
    created_at: str
