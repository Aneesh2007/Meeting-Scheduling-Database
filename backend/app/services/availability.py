from datetime import datetime, timedelta
from typing import Any
from app.database import fetch_all, fetch_one

CATEGORY = "02_availability"


def check_conflicts(
    user_id: int,
    start: datetime | str,
    end: datetime | str,
    exclude_event_id: int | None = None,
) -> list[dict[str, Any]]:
    """params: $1 user_id, $2 start, $3 end, $4 exclude_event_id (nullable)"""
    return fetch_all(CATEGORY, "check_conflicts.sql", user_id, start, end, exclude_event_id)


def find_free_gaps(
    user_ids: list[int],
    range_start: datetime | str,
    range_end: datetime | str,
    min_duration: timedelta | str,
    limit: int = 20,
) -> list[dict[str, Any]]:
    """params: $1 user_ids int[], $2 range_start, $3 range_end, $4 min_duration interval, $5 limit"""
    return fetch_all(
        CATEGORY,
        "find_free_gaps.sql",
        user_ids,
        range_start,
        range_end,
        min_duration,
        limit,
    )


def find_next_available_slot(
    user_ids: list[int],
    after: datetime | str,
    search_horizon_end: datetime | str,
    duration: timedelta | str,
) -> dict[str, Any] | None:
    """params: $1 user_ids int[], $2 after, $3 search_horizon_end, $4 duration interval"""
    return fetch_one(
        CATEGORY,
        "find_next_available_slot.sql",
        user_ids,
        after,
        search_horizon_end,
        duration,
    )


def get_busy_intervals(
    user_ids: list[int],
    range_start: datetime | str,
    range_end: datetime | str,
) -> list[dict[str, Any]]:
    """params: $1 user_ids int[], $2 range_start, $3 range_end"""
    return fetch_all(CATEGORY, "get_busy_intervals.sql", user_ids, range_start, range_end)


def get_merged_busy_intervals(
    user_ids: list[int],
    range_start: datetime | str,
    range_end: datetime | str,
) -> list[dict[str, Any]]:
    """params: $1 user_ids int[], $2 range_start, $3 range_end"""
    return fetch_all(CATEGORY, "get_merged_busy_intervals.sql", user_ids, range_start, range_end)


def is_free(
    user_id: int,
    start: datetime | str,
    end: datetime | str,
) -> bool:
    """params: $1 user_id, $2 start, $3 end -> returns bool"""
    row = fetch_one(CATEGORY, "is_free.sql", user_id, start, end)
    return bool(row and row.get("is_free"))
