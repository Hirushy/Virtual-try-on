from fastapi import APIRouter, Depends, HTTPException, status
from core.database import db
from core.auth import get_current_user
from core.models import OutfitCreate
from bson import ObjectId
from bson.errors import InvalidId
import datetime

router = APIRouter()

@router.post("/outfits")
async def create_outfit(outfit: OutfitCreate, user_id: str = Depends(get_current_user)):
    # Convert Pydantic model to dict and inject user_id
    outfit_dict = outfit.dict()
    outfit_dict["user_id"] = user_id
    outfit_dict["created_at"] = datetime.datetime.utcnow()
    
    result = await db.outfits.insert_one(outfit_dict)
    return {"id": str(result.inserted_id)}


@router.get("/outfits")
async def get_outfits(user_id: str = Depends(get_current_user)):
    outfits = []
    # Sort by created_at descending if possible
    async for o in db.outfits.find({"user_id": user_id}).sort("created_at", -1):
        o["_id"] = str(o["_id"])
        outfits.append(o)
    return outfits

@router.delete("/outfits/{outfit_id}")
async def delete_outfit(outfit_id: str, user_id: str = Depends(get_current_user)):
    try:
        oid = ObjectId(outfit_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid outfit ID format")

    result = await db.outfits.delete_one({"_id": oid, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outfit not found or unauthorized")
    
    return {"status": "success", "message": "Outfit deleted"}
