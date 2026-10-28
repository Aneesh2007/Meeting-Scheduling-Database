"""Availability endpoints."""

from datetime import datetime, timedelta
from typing import Any, Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel

from app.services import availability

router = APIRouter(prefix="/availability", tags=["Availability"])


class FreeGapsRequest(BaseModel):
    user_ids: list[int]
    range_start: datetime | str
    range_end: datetime | str
    min_duration: timedelta | str
    limit: int = 20


class NextAvailableSlotRequest(BaseModel):
    user_ids: list[int]
    after: datetime | str
    search_horizon_end: datetime | str
    duration: timedelta | str


class BusyIntervalsRequest(BaseModel):
    user_ids: list[int]
    range_start: datetime | str
    range_end: datetime | str


@router.get("/check")
def check_conflicts(
    start: datetime | str,
    end: datetime | str,
    user_id: int = Query(..., gt=0),
    exclude_event_id: Optional[int] = None,
):
    """Events overlapping [start, end) for a user."""
    return availability.check_conflicts(
        user_id=user_id,
        start=start,
        end=end,
        exclude_event_id=exclude_event_id,
    )


@router.get("/is-free")
def is_free(
    start: datetime | str,
    end: datetime | str,
    user_id: int = Query(..., gt=0),
):
    return {"is_free": availability.is_free(user_id=user_id, start=start, end=end)}


@router.get("/free-gaps")
def find_free_gaps(
    range_start: datetime | str,
    range_end: datetime | str,
    min_duration: str,
    user_ids: str = Query(..., description="Comma-separated user IDs"),
    limit: int = Query(20, ge=1, le=100),
):
    ids = [int(x.strip()) for x in user_ids.split(",") if x.strip()]
    return availability.find_free_gaps(
        user_ids=ids,
        range_start=range_start,
        range_end=range_end,
        min_duration=min_duration,
        limit=limit,
    )


@router.get("/busy-intervals")
def get_busy_intervals(
    range_start: datetime | str,
    range_end: datetime | str,
    user_ids: str = Query(..., description="Comma-separated user IDs"),
):
    ids = [int(x.strip()) for x in user_ids.split(",") if x.strip()]
    return availability.get_merged_busy_intervals(
        user_ids=ids,
        range_start=range_start,
        range_end=range_end,
    )


@router.get("/next-available-slot")
def find_next_available_slot(
    after: datetime | str,
    search_horizon_end: datetime | str,
    duration: str,
    user_ids: str = Query(..., description="Comma-separated user IDs"),
):
    ids = [int(x.strip()) for x in user_ids.split(",") if x.strip()]
    return availability.find_next_available_slot(
        user_ids=ids,
        after=after,
        search_horizon_end=search_horizon_end,
        duration=duration,
    )
