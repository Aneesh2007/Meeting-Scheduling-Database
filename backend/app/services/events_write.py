from datetime import datetime, timedelta
from typing import Any
from app.database import fetch_all, fetch_one

CATEGORY = "05_writes"


def create_event(
    user_id: int,
    title: str,
    description: str | None,
    start: datetime | str,
    end: datetime | str,
    participant_ids: list[int] | None = None,
) -> dict[str, Any] | None:
    """
    params: $1 user_id, $2 title, $3 description (nullable), $4 start, $5 end, $6 participant_ids int[]
    returns: {'event_id': ..., 'participants_added': ...}
    """
    return fetch_one(
        CATEGORY,
        "create_event.sql",
        user_id,
        title,
        description,
        start,
        end,
        participant_ids or [],
        commit=True,
    )


def update_event(
    user_id: int,
    event_id: int,
    title: str | None = None,
    description: str | None = None,
    start: datetime | str | None = None,
    end: datetime | str | None = None,
) -> dict[str, Any] | None:
    """
    params: $1 user_id, $2 event_id, $3 title, $4 description, $5 start, $6 end (all nullable)
    """
    return fetch_one(
        CATEGORY,
        "update_event.sql",
        user_id,
        event_id,
        title,
        description,
        start,
        end,
        commit=True,
    )


def reschedule_event(
    user_id: int,
    event_id: int,
    new_start: datetime | str,
    new_end: datetime | str,
) -> dict[str, Any] | None:
    """params: $1 user_id, $2 event_id, $3 new_start, $4 new_end"""
    return fetch_one(
        CATEGORY,
        "reschedule_event.sql",
        user_id,
        event_id,
        new_start,
        new_end,
        commit=True,
    )


def delete_event(user_id: int, event_id: int) -> dict[str, Any] | None:
    """params: $1 user_id, $2 event_id"""
    return fetch_one(CATEGORY, "delete_event.sql", user_id, event_id, commit=True)


def duplicate_event(
    user_id: int,
    source_event_id: int,
    new_start: datetime | str,
) -> dict[str, Any] | None:
    """params: $1 user_id, $2 source event_id, $3 new_start"""
    return fetch_one(
        CATEGORY,
        "duplicate_event.sql",
        user_id,
        source_event_id,
        new_start,
        commit=True,
    )


def preview_bulk_move_events(
    user_id: int,
    range_start: datetime | str,
    range_end: datetime | str,
    shift_interval: timedelta | str,
) -> list[dict[str, Any]]:
    """params: $1 user_id, $2 range_start, $3 range_end, $4 shift interval"""
    return fetch_all(
        CATEGORY,
        "preview_bulk_move_events.sql",
        user_id,
        range_start,
        range_end,
        shift_interval,
    )


def bulk_move_events(
    user_id: int,
    range_start: datetime | str,
    range_end: datetime | str,
    shift_interval: timedelta | str,
) -> dict[str, Any] | None:
    """params: $1 user_id, $2 range_start, $3 range_end, $4 shift interval"""
    return fetch_one(
        CATEGORY,
        "bulk_move_events.sql",
        user_id,
        range_start,
        range_end,
        shift_interval,
        commit=True,
    )
