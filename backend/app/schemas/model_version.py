from typing import Dict, Any, Optional
from app.schemas.base import CamelModel

class ModelMetrics(CamelModel):
    precision: float
    recall: float
    f1_score: float
    m_ap50: float
    iou_segmentation: float
    dice_coefficient: float
    accuracy: float

class ModelVersionResponse(CamelModel):
    id: str
    name: str
    version: str
    model_type: str
    dataset_reference: str
    dataset_version: str
    training_status: str
    evaluation_date: str
    metrics: Dict[str, Any]
    deployment_status: str
