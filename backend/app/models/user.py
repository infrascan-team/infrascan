import datetime
from sqlalchemy import Column, String, DateTime, Boolean
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="Civil Engineer")
    department = Column(String, default="Civil Infrastructure Division")
    avatar = Column(String, default="IS")
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
