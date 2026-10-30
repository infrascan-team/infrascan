import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime
from app.db.session import Base

class Asset(Base):
    __tablename__ = "assets"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False)  # Bridge, Tunnel, Road, Dam, Building, etc.
    address = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    construction_year = Column(Integer, default=2010)
    material_type = Column(String, default="Reinforced Concrete")
    responsible_department = Column(String, default="Civil Infrastructure Division")
    inspection_frequency_months = Column(Integer, default=6)
    importance = Column(String, default="Standard")
    condition_status = Column(String, default="Good")  # Good, Fair, Poor, Critical
    last_inspection_date = Column(String, nullable=True)
    next_scheduled_inspection = Column(String, nullable=True)
    open_findings_count = Column(Integer, default=0)
    maintenance_history_count = Column(Integer, default=0)
    notes = Column(String, default="")
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
