from fastapi import APIRouter, Depends, HTTPException, status
from core.database import db
from core.auth import get_current_user
from core.models import AvatarCreate
from bson import ObjectId
from bson.errors import InvalidId

router = APIRouter()

@router.post("/avatars")
async def create_avatar(avatar: AvatarCreate, user_id: str = Depends(get_current_user)):
    # Convert Pydantic model to dict and inject user_id
    avatar_dict = avatar.dict()
    avatar_dict["user_id"] = user_id
    
    result = await db.avatars.insert_one(avatar_dict)
    return {"id": str(result.inserted_id)}


@router.get("/avatars")
async def get_avatars(user_id: str = Depends(get_current_user)):
    avatars = []
    async for av in db.avatars.find({"user_id": user_id}):
        av["_id"] = str(av["_id"])
        avatars.append(av)
    return avatars

@router.delete("/avatars/{avatar_id}")
async def delete_avatar(avatar_id: str, user_id: str = Depends(get_current_user)):
    try:
        oid = ObjectId(avatar_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid avatar ID format")

    result = await db.avatars.delete_one({"_id": oid, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Avatar not found or unauthorized")
    
    return {"status": "success", "message": "Avatar deleted"}
