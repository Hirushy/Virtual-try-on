# ============================================================
# Virtual Try-On Backend API
# FastAPI Backend - Pipeline + Fit Analysis Engine
# ============================================================

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pydantic import BaseModel

import os
import shutil
import json
import traceback

# Pipeline Modules
from detect_body import run_pose_detection
from estimate_body_safe import run_safe_estimation
from estimate_body_shape import run_body_shape
from build_avatar_data import build_avatar_data

# Fit Analysis
from fit_analyzer import analyze_fit

# ============================================================
# App Initialization
# ============================================================

app = FastAPI(title="Virtual Try-On Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# Directories
# ============================================================

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ============================================================
# Root Endpoint
# ============================================================

@app.get("/")
def root():
    return {"message": "FastAPI server is running"}

# ============================================================
# Utility Functions
# ============================================================

def clamp01(x):
    try:
        x = float(x)
    except:
        return 0.0
    return max(0.0, min(1.0, x))

# ============================================================
# Avatar Contract Builder
# ============================================================

def build_locked_contract(avatar_data: dict):

    proportions = avatar_data.get("proportions", {})
    front = proportions.get("front", {}) if isinstance(proportions, dict) else {}
    weights = avatar_data.get("shape_key_weights", {})

    return {
        "gender": avatar_data.get("gender", "unknown"),
        "proportions": {
            "front": front,
            "has_side_image": proportions.get("has_side_image", False),
        },
        "shape_key_weights": {
            "Chest": clamp01(weights.get("Chest", 0.0)),
            "Waist": clamp01(weights.get("Waist", 0.0)),
            "Hips": clamp01(weights.get("Hips", 0.0)),
        },
        "note": "Shape-similar privacy-safe avatar contract"
    }

# ============================================================
# Upload Photo Pipeline
# ============================================================

@app.post("/upload-photos")
async def upload_photos(
    front: UploadFile = File(...),
    side_or_back: Optional[UploadFile] = File(None)
):

    try:
        front_path = os.path.join(UPLOAD_DIR, "front.jpg")

        with open(front_path, "wb") as buffer:
            shutil.copyfileobj(front.file, buffer)

        if side_or_back:
            side_path = os.path.join(UPLOAD_DIR, "side.jpg")

            with open(side_path, "wb") as buffer:
                shutil.copyfileobj(side_or_back.file, buffer)

        # Run AI Pipeline
        run_pose_detection()
        run_safe_estimation()
        run_body_shape()
        build_avatar_data()

    except Exception:
        return {
            "status": "error",
            "message": "Pipeline execution failed",
            "details": traceback.format_exc()
        }

    avatar_path = os.path.join(OUTPUT_DIR, "avatar_data.json")

    if not os.path.exists(avatar_path):
        return {
            "status": "error",
            "message": "Avatar data not generated"
        }

    with open(avatar_path, "r", encoding="utf-8") as f:
        avatar_data = json.load(f)

    return {
        "status": "success",
        "avatar_data": avatar_data
    }

# ============================================================
# Fetch Avatar Contract
# ============================================================

@app.get("/avatar-data")
def get_avatar_data():

    avatar_path = os.path.join(OUTPUT_DIR, "avatar_data.json")

    if not os.path.exists(avatar_path):
        return {
            "status": "error",
            "message": "Upload photos first"
        }

    with open(avatar_path, "r", encoding="utf-8") as f:
        avatar_data = json.load(f)

    return build_locked_contract(avatar_data)

# ============================================================
# Fit Analysis API
# ============================================================

class FitRequest(BaseModel):
    bodyMeasurements: dict
    selectedSize: str


@app.post("/api/analyze-fit")
def analyze_fit_api(request: FitRequest):

    body_measurements = request.bodyMeasurements
    selected_size = request.selectedSize

    zones = analyze_fit(body_measurements, selected_size)

    return {
        "status": "success",
        "zones": zones
    }