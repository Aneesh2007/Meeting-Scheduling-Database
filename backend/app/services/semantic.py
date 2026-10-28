from datetime import datetime
from typing import Any, Sequence
from app.database import fetch_all, fetch_one

CATEGORY = "06_semantic"


def _format_vector(vec: Sequence[float] | str) -> str:
    if isinstance(vec, str):
        return vec
    return "[" + ",".join(str(float(x)) for x in vec) + "]"


def semantic_search(
    user_id: int,
    query_vector: Sequence[float] | str,
    k: int = 10,
    range_start: datetime | str | None = None,
    range_end: datetime | str | None = None,
) -> list[dict[str, Any]]:
    """
    params: $1 user_id, $2 query_vector (text '[...]'), $3 k, $4 range_start (nullable), $5 range_end (nullable)
    """
    return fetch_all(
        CATEGORY,
        "semantic_search.sql",
        user_id,
        _format_vector(query_vector),
        k,
        range_start,
        range_end,
    )


def find_similar_events(
    user_id: int,
    event_id: int,
    k: int = 10,
) -> list[dict[str, Any]]:
    """params: $1 user_id, $2 event_id, $3 k"""
    return fetch_all(CATEGORY, "find_similar_events.sql", user_id, event_id, k)


def get_events_missing_embeddings(batch_limit: int = 100) -> list[dict[str, Any]]:
    """params: $1 batch limit (INTERNAL utility)"""
    return fetch_all(CATEGORY, "get_events_missing_embeddings.sql", batch_limit)


def upsert_embedding(
    event_id: int,
    vector: Sequence[float] | str,
    model: str,
) -> dict[str, Any] | None:
    """params: $1 event_id, $2 vector (text '[...]'), $3 model name (INTERNAL utility)"""
    return fetch_one(
        CATEGORY,
        "upsert_embedding.sql",
        event_id,
        _format_vector(vector),
        model,
        commit=True,
    )
