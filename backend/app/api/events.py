"""Event endpoints: CRUD, reschedule, duplicate."""

from datetime import datetime
from typing import Any, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.services import events_read, events_write

router = APIRouter(prefix="/events", tags=["Events"])


class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start: datetime | str
    end: datetime | str
    participant_ids: Optional[list[int]] = None


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start: Optional[datetime | str] = None
    end: Optional[datetime | str] = None


class RescheduleRequest(BaseModel):
    new_start: datetime | str
    new_end: datetime | str


class DuplicateRequest(BaseModel):
    new_start: datetime | str


@router.get("")
def list_events(
    user_id: int = Query(..., gt=0),
    range_start: Optional[datetime | str] = None,
    range_end: Optional[datetime | str] = None,
    limit: int = Query(100, ge=1, le=500),
):
    """List events overlapping a time range for a user (calendar view)."""
    return events_read.list_events(
        user_id=user_id,
        range_start=range_start,
        range_end=range_end,
        limit=limit,
    )


@router.get("/{event_id}")
def get_event(event_id: int, user_id: int = Query(..., gt=0)):
    event = events_read.get_event(user_id=user_id, event_id=event_id)

    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")

    return event


@router.post("")
def create_event(user_id: int = Query(..., gt=0), payload: EventCreate = None):
    result = events_write.create_event(
        user_id=user_id,
        title=payload.title,
        description=payload.description,
        start=payload.start,
        end=payload.end,
        participant_ids=payload.participant_ids,
    )

    if result is None:
        raise HTTPException(status_code=409, detail="Event could not be created (conflict or invalid participants).")

    return result


@router.put("/{event_id}")
def update_event(
    event_id: int,
    user_id: int = Query(..., gt=0),
    payload: EventUpdate = None,
):
    result = events_write.update_event(
        user_id=user_id,
        event_id=event_id,
        title=payload.title,
        description=payload.description,
        start=payload.start,
        end=payload.end,
    )

    if result is None:
        raise HTTPException(status_code=404, detail="Event not found or not owned by user.")

    return result


@router.delete("/{event_id}")
def delete_event(event_id: int, user_id: int = Query(..., gt=0)):
    result = events_write.delete_event(user_id=user_id, event_id=event_id)

    if result is None:
        raise HTTPException(status_code=404, detail="Event not found or not owned by user.")

    return result


@router.post("/{event_id}/reschedule")
def reschedule_event(
    event_id: int,
    user_id: int = Query(..., gt=0),
    payload: RescheduleRequest = None,
):
    result = events_write.reschedule_event(
        user_id=user_id,
        event_id=event_id,
        new_start=payload.new_start,
        new_end=payload.new_end,
    )

    if result is None:
        raise HTTPException(status_code=404, detail="Event not found or not owned by user.")

    return result


@router.post("/{event_id}/duplicate")
def duplicate_event(
    event_id: int,
    user_id: int = Query(..., gt=0),
    payload: DuplicateRequest = None,
):
    result = events_write.duplicate_event(
        user_id=user_id,
        source_event_id=event_id,
        new_start=payload.new_start,
    )

    if result is None:
        raise HTTPException(status_code=404, detail="Event not found or not owned by user.")

    return result
