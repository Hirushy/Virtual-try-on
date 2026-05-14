from pydantic import BaseModel, EmailStr
from typing import Optional, Dict

class UserAuth(BaseModel):
    email: EmailStr
    password: str
    pin: Optional[str] = None

class AvatarCreate(BaseModel):
    name: str
    gender: str
    config: dict
    backend_data: Optional[dict] = None
    summary: Optional[str] = None

class OutfitCreate(BaseModel):
    name: str
    gender: str
    avatar_config: dict
    avatar_data: Optional[dict] = None
    selections: dict
