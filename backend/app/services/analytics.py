from datetime import datetime, timedelta
from typing import Any
from app.database import fetch_all, fetch_one

CATEGORY = "07_analytics"


def busiest_day(
    user_id: int,
    range_start: datetime | str,
    range_end: datetime | str,
    timezone: str = "UTC",
) -> dict[str, Any] | None:
    """params: $1 user_id, $2 range_start, $3 range_end, $4 IANA timezone"""
    return fetch_one(CATEGORY, "busiest_day.sql", user_id, range_start, range_end, timezone)


def count_events_by_day(
    user_id: int,
    range_start: datetime | str,
    range_end: datetime | str,
    timezone: str = "UTC",
) -> list[dict[str, Any]]:
    """params: $1 user_id, $2 range_start, $3 range_end, $4 IANA timezone"""
    return fetch_all(
        CATEGORY,
        "count_events_by_day.sql",
        user_id,
        range_start,
        range_end,
        timezone,
    )


def get_back_to_back_events(
    user_id: int,
    range_start: datetime | str,
    range_end: datetime | str,
    max_gap: timedelta | str = "0 minutes",
) -> list[dict[str, Any]]:
    """params: $1 user_id, $2 range_start, $3 range_end, $4 max_gap interval"""
    return fetch_all(
        CATEGORY,
        "get_back_to_back_events.sql",
        user_id,
        range_start,
        range_end,
        max_gap,
    )


def get_double_booked_events(
    user_id: int,
    range_start: datetime | str,
    range_end: datetime | str,
    limit: int = 50,
) -> list[dict[str, Any]]:
    """params: $1 user_id, $2 range_start, $3 range_end, $4 limit"""
    return fetch_all(
        CATEGORY,
        "get_double_booked_events.sql",
        user_id,
        range_start,
        range_end,
        limit,
    )


def get_frequent_collaborators(
    user_id: int,
    range_start: datetime | str,
    range_end: datetime | str,
    limit: int = 10,
) -> list[dict[str, Any]]:
    """params: $1 user_id, $2 range_start, $3 range_end, $4 limit"""
    return fetch_all(
        CATEGORY,
        "get_frequent_collaborators.sql",
        user_id,
        range_start,
        range_end,
        limit,
    )


def get_longest_events(
    user_id: int,
    range_start: datetime | str,
    range_end: datetime | str,
    limit: int = 10,
) -> list[dict[str, Any]]:
    """params: $1 user_id, $2 range_start, $3 range_end, $4 limit"""
    return fetch_all(
        CATEGORY,
        "get_longest_events.sql",
        user_id,
        range_start,
        range_end,
        limit,
    )


def total_meeting_hours(
    user_id: int,
    range_start: datetime | str,
    range_end: datetime | str,
) -> dict[str, Any] | None:
    """params: $1 user_id, $2 range_start, $3 range_end"""
    return fetch_one(CATEGORY, "total_meeting_hours.sql", user_id, range_start, range_end)
