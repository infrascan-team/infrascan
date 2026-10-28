from typing import Optional
from pydantic import BaseModel

class AssetBase(BaseModel):
    name: str
    type: str  # Bridge, Tunnel, Road, Dam, Building
    location: str
    condition_score: Optional[int] = 85
    status: Optional[str] = "Operational"
    material: Optional[str] = "Reinforced Concrete"
    year_built: Optional[int] = 2010
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class AssetCreate(AssetBase):
    id: Optional[str] = None

class AssetResponse(AssetBase):
    id: str

    class Config:
        from_attributes = True
