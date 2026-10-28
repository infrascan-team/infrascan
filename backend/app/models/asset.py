import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime
from app.db.session import Base

class Asset(Base):
    __tablename__ = "assets"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False)  # Bridge, Tunnel, Road, Dam, Building
    location = Column(String, nullable=False)
    condition_score = Column(Integer, default=85)
    status = Column(String, default="Operational")  # Operational, Needs Maintenance, Under Review, Critical
    material = Column(String, default="Reinforced Concrete")
    year_built = Column(Integer, default=2010)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
