import datetime
from sqlalchemy import Column, String, Boolean, DateTime
from app.db.session import Base

class MaintenanceWorkOrder(Base):
    __tablename__ = "work_orders"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    asset_id = Column(String, nullable=False, index=True)
    asset_name = Column(String, nullable=False)
    inspection_id = Column(String, nullable=False)
    finding_id = Column(String, nullable=True)
    priority = Column(String, default="Medium Priority")
    status = Column(String, default="Open")
    assigned_team = Column(String, default="Bridge Maintenance Crew A")
    assigned_engineer = Column(String, default="Sarah Lin")
    created_at = Column(String, default=lambda: datetime.date.today().isoformat())
    due_date = Column(String, nullable=False)
    completed_at = Column(String, nullable=True)
    repair_recommendations = Column(String, default="")
    completion_notes = Column(String, nullable=True)
    follow_up_inspection_required = Column(Boolean, default=True)
