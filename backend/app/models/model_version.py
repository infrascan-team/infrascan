from sqlalchemy import Column, String, JSON
from app.db.session import Base

class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    version = Column(String, nullable=False)
    model_type = Column(String, nullable=False)
    dataset_reference = Column(String, nullable=False)
    dataset_version = Column(String, nullable=False)
    training_status = Column(String, default="Trained")
    evaluation_date = Column(String, nullable=False)
    metrics = Column(JSON, default=dict)
    deployment_status = Column(String, default="Active")
