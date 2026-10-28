"""User calendar entry endpoints."""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.services import user_calendar

router = APIRouter(prefix="/calendar", tags=["Calendar"])


class AddCalendarEntryRequest(BaseModel):
    event_id: int


@router.get("/entries")
def list_calendar_entries(
    user_id: int = Query(..., gt=0),
    limit: int = Query(100, ge=1, le=500),
):
    return user_calendar.list_calendar_entries(user_id=user_id, limit=limit)


@router.post("/entries")
def add_to_my_calendar(
    user_id: int = Query(..., gt=0),
    payload: AddCalendarEntryRequest = None,
):
    result = user_calendar.add_to_my_calendar(
        user_id=user_id,
        event_id=payload.event_id,
    )

    if result is None:
        raise HTTPException(status_code=404, detail="Event not visible to user or already on calendar.")

    return result


@router.delete("/entries/{event_id}")
def remove_from_my_calendar(
    event_id: int,
    user_id: int = Query(..., gt=0),
):
    result = user_calendar.remove_from_my_calendar(
        user_id=user_id,
        event_id=event_id,
    )

    if result is None:
        raise HTTPException(status_code=404, detail="Calendar entry not found.")

    return result
