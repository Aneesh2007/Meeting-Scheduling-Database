from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services import users

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/{user_id}")
def get_user(user_id: int):
    user = users.get_user_by_id(user_id)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.get("/")
def find_users(q: str = Query("", min_length=0), limit: int = Query(10, ge=1, le=100)):
    """Search users by name or email fragment. Returns matching users for inviting."""
    return users.find_user(query=q, limit=limit)
