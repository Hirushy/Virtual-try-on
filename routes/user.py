from fastapi import APIRouter, HTTPException, status
from core.database import db
from core.auth import hash_password, verify_password, create_token
from core.models import UserAuth

router = APIRouter()

@router.post("/register")
async def register(user: UserAuth):
    existing = await db.users.find_one({"email": user.email})
    
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")

    new_user = {
        "email": user.email,
        "password": hash_password(user.password),
        "pin": user.pin
    }

    result = await db.users.insert_one(new_user)
    return {"message": "User created", "id": str(result.inserted_id)}


@router.post("/login")
async def login(user: UserAuth):
    db_user = await db.users.find_one({"email": user.email})

    if not db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not found")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Wrong password")

    token = create_token({"user_id": str(db_user["_id"])})

    return {
        "token": token,
        "email": db_user["email"]
    }

@router.get("/users/all")
async def fetch_all_users():
    users = []
    async for u in db.users.find({}, {"password": 0, "pin": 0}):
        u["_id"] = str(u["_id"])
        users.append(u)
    return users
