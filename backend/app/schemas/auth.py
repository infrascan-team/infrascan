from typing import Optional
from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserResponse"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = "Civil Engineer"

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str = "Civil Engineer"
    department: Optional[str] = "Civil Infrastructure Division"
    status: Optional[str] = "Active"
    avatar: Optional[str] = "IS"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str

    class Config:
        from_attributes = True

Token.model_rebuild()
