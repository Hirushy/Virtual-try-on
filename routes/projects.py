from fastapi import APIRouter, HTTPException, Depends, status
from core.database import db
from core.auth import get_current_user
from pydantic import BaseModel
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

router = APIRouter()

class Task(BaseModel):
    id: str
    title: str
    completed: bool = False
    assigned_to: Optional[str] = None

class ProjectCreate(BaseModel):
    title: str
    description: str
    status: str = "Active"
    priority: str = "Medium"
    members: List[str] = []
    tasks: List[Task] = []
    deadline: Optional[str] = None

@router.get("/projects")
async def get_projects(user_id: str = Depends(get_current_user)):
    projects = []
    # Find projects where user is a member or creator
    async for p in db.projects.find({"$or": [{"creator_id": user_id}, {"members": user_id}]}):
        p["_id"] = str(p["_id"])
        projects.append(p)
    return projects

@router.post("/projects")
async def create_project(project: ProjectCreate, user_id: str = Depends(get_current_user)):
    p_dict = project.dict()
    p_dict["creator_id"] = user_id
    p_dict["created_at"] = datetime.utcnow().isoformat()
    
    result = await db.projects.insert_one(p_dict)
    return {"id": str(result.inserted_id), "status": "success"}

@router.get("/projects/{project_id}")
async def get_project(project_id: str, user_id: str = Depends(get_current_user)):
    try:
        oid = ObjectId(project_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid project ID")
        
    p = await db.projects.find_one({"_id": oid})
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
        
    p["_id"] = str(p["_id"])
    return p

@router.patch("/projects/{project_id}")
async def update_project(project_id: str, updates: dict, user_id: str = Depends(get_current_user)):
    try:
        oid = ObjectId(project_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid project ID")
        
    # Security: Only creator can update? For now allow any member
    existing = await db.projects.find_one({"_id": oid, "$or": [{"creator_id": user_id}, {"members": user_id}]})
    if not existing:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    await db.projects.update_one({"_id": oid}, {"$set": updates})
    return {"status": "success"}

@router.delete("/projects/{project_id}")
async def delete_project(project_id: str, user_id: str = Depends(get_current_user)):
    try:
        oid = ObjectId(project_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid project ID")
        
    result = await db.projects.delete_one({"_id": oid, "creator_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=403, detail="Unauthorized or not found")
        
    return {"status": "success"}
