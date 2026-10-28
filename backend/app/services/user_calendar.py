from typing import Any
from app.database import fetch_all, fetch_one

CATEGORY = "08_user_calendar"


def add_to_my_calendar(user_id: int, event_id: int) -> dict[str, Any] | None:
    """params: $1 user_id, $2 event_id"""
    return fetch_one(CATEGORY, "add_to_my_calendar.sql", user_id, event_id, commit=True)


def list_calendar_entries(user_id: int, limit: int = 100) -> list[dict[str, Any]]:
    """params: $1 user_id, $2 limit"""
    return fetch_all(CATEGORY, "list_calendar_entries.sql", user_id, limit)


def remove_from_my_calendar(user_id: int, event_id: int) -> dict[str, Any] | None:
    """params: $1 user_id, $2 event_id"""
    return fetch_one(CATEGORY, "remove_from_my_calendar.sql", user_id, event_id, commit=True)
