from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import traceback
import os
from .user_service import (
    get_users, 
    get_user_by_id, 
    activate_chaos, 
    deactivate_chaos, 
    is_chaos_active,
    get_source_code
)

app = FastAPI(title="ChaosMedic Demo App")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "user-api",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/users")
async def read_users():
    try:
        users = get_users()
        return users
    except Exception as e:
        return Response(
            content=f'{{"error": "{str(e)}", "traceback": {__import__("json").dumps(traceback.format_exc())}, "service": "user-api", "timestamp": "{datetime.utcnow().isoformat()}"}}',
            media_type="application/json",
            status_code=500
        )

@app.get("/users/{user_id}")
async def read_user(user_id: int):
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/chaos/activate")
async def activate_chaos_endpoint():
    activate_chaos()
    return {"message": "Chaos activated"}

@app.post("/chaos/deactivate")
async def deactivate_chaos_endpoint():
    deactivate_chaos()
    return {"message": "Chaos deactivated"}

@app.get("/chaos/status")
async def chaos_status():
    return {"chaos_active": is_chaos_active()}

@app.get("/source/{filename}")
async def source_code(filename: str):
    if filename != "user_service.py":
        raise HTTPException(status_code=404, detail="File not found or not allowed")
    try:
        code = get_source_code()
        return Response(content=code, media_type="text/plain")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
