from datetime import date, datetime
from typing import Any
from app.database import fetch_all, fetch_one

CATEGORY = "01_events_read"


def get_current_events(user_id: int) -> list[dict[str, Any]]:
    """params: $1 user_id"""
    return fetch_all(CATEGORY, "get_current_events.sql", user_id)


def get_event(user_id: int, event_id: int) -> dict[str, Any] | None:
    """params: $1 user_id, $2 event_id"""
    return fetch_one(CATEGORY, "get_event.sql", user_id, event_id)


def get_events_i_own(
    user_id: int,
    range_start: datetime | str | None = None,
    range_end: datetime | str | None = None,
    limit: int = 50,
) -> list[dict[str, Any]]:
    """params: $1 user_id, $2 range_start (nullable), $3 range_end (nullable), $4 limit"""
    return fetch_all(CATEGORY, "get_events_i_own.sql", user_id, range_start, range_end, limit)


def get_events_on_date(
    user_id: int,
    target_date: date | str,
    timezone: str = "UTC",
    limit: int = 50,
) -> list[dict[str, Any]]:
    """params: $1 user_id, $2 date, $3 IANA timezone, $4 limit"""
    return fetch_all(CATEGORY, "get_events_on_date.sql", user_id, target_date, timezone, limit)


def get_next_event(user_id: int) -> dict[str, Any] | None:
    """params: $1 user_id"""
    return fetch_one(CATEGORY, "get_next_event.sql", user_id)


def get_past_events(user_id: int, limit: int = 50) -> list[dict[str, Any]]:
    """params: $1 user_id, $2 limit"""
    return fetch_all(CATEGORY, "get_past_events.sql", user_id, limit)


def get_upcoming(user_id: int, limit: int = 50) -> list[dict[str, Any]]:
    """params: $1 user_id, $2 limit"""
    return fetch_all(CATEGORY, "get_upcoming.sql", user_id, limit)


def list_events(
    user_id: int,
    range_start: datetime | str,
    range_end: datetime | str,
    limit: int = 100,
) -> list[dict[str, Any]]:
    """params: $1 user_id, $2 range_start, $3 range_end, $4 limit"""
    return fetch_all(CATEGORY, "list_events.sql", user_id, range_start, range_end, limit)


def search_events_text(
    user_id: int,
    keyword: str,
    range_start: datetime | str | None = None,
    range_end: datetime | str | None = None,
    limit: int = 50,
) -> list[dict[str, Any]]:
    """params: $1 user_id, $2 keyword, $3 range_start (nullable), $4 range_end (nullable), $5 limit"""
    return fetch_all(
        CATEGORY,
        "search_events_text.sql",
        user_id,
        keyword,
        range_start,
        range_end,
        limit,
    )
