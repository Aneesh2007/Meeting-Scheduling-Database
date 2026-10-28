"""Analytics endpoints (read-only summaries)."""

from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Query

from app.services import analytics

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/busiest-day")
def busiest_day(
    range_start: datetime | str,
    range_end: datetime | str,
    user_id: int = Query(..., gt=0),
    timezone: str = "UTC",
):
    return analytics.busiest_day(
        user_id=user_id,
        range_start=range_start,
        range_end=range_end,
        timezone=timezone,
    )


@router.get("/events-by-day")
def count_events_by_day(
    range_start: datetime | str,
    range_end: datetime | str,
    user_id: int = Query(..., gt=0),
    timezone: str = "UTC",
):
    return analytics.count_events_by_day(
        user_id=user_id,
        range_start=range_start,
        range_end=range_end,
        timezone=timezone,
    )


@router.get("/total-meeting-hours")
def total_meeting_hours(
    range_start: datetime | str,
    range_end: datetime | str,
    user_id: int = Query(..., gt=0),
):
    return analytics.total_meeting_hours(
        user_id=user_id,
        range_start=range_start,
        range_end=range_end,
    )


@router.get("/double-booked-events")
def get_double_booked_events(
    range_start: datetime | str,
    range_end: datetime | str,
    user_id: int = Query(..., gt=0),
    limit: int = Query(50, ge=1, le=200),
):
    return analytics.get_double_booked_events(
        user_id=user_id,
        range_start=range_start,
        range_end=range_end,
        limit=limit,
    )


@router.get("/back-to-back-events")
def get_back_to_back_events(
    range_start: datetime | str,
    range_end: datetime | str,
    user_id: int = Query(..., gt=0),
    max_gap: str = "0 minutes",
):
    return analytics.get_back_to_back_events(
        user_id=user_id,
        range_start=range_start,
        range_end=range_end,
        max_gap=max_gap,
    )


@router.get("/frequent-collaborators")
def get_frequent_collaborators(
    range_start: datetime | str,
    range_end: datetime | str,
    user_id: int = Query(..., gt=0),
    limit: int = Query(10, ge=1, le=50),
):
    return analytics.get_frequent_collaborators(
        user_id=user_id,
        range_start=range_start,
        range_end=range_end,
        limit=limit,
    )


@router.get("/longest-events")
def get_longest_events(
    range_start: datetime | str,
    range_end: datetime | str,
    user_id: int = Query(..., gt=0),
    limit: int = Query(10, ge=1, le=50),
):
    return analytics.get_longest_events(
        user_id=user_id,
        range_start=range_start,
        range_end=range_end,
        limit=limit,
    )
