from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "shadow-fit-super-secret-key-2025")
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)

# Password hashing
def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(password, hashed):
    return pwd_context.verify(password, hashed)

# Create JWT token
def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Protect Routes Dependency
async def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# NEW: Optional Auth Dependency (Allows Guest)
async def get_user_or_guest(token: Optional[HTTPAuthorizationCredentials] = Depends(optional_security)):
    """
    Returns user_id if token is present and valid, 
    otherwise returns 'guest'.
    """
    if token is None or not hasattr(token, 'credentials') or not token.credentials:
        return "guest"
    
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("user_id", "guest")
    except Exception:
        return "guest"
