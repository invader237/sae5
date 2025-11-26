from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    user_id: UUID
    username: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True  # (pydantic v2), sinon orm_mode = True en v1


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PasswordUpdate(BaseModel):
    old_password: str
    new_password: str
