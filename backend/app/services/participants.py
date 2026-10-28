from typing import Any, Literal
from app.database import fetch_all, fetch_one

CATEGORY = "04_participants"
RSVPStatus = Literal["ACCEPTED", "DECLINED", "PENDING"]
VALID_STATUSES = {"ACCEPTED", "DECLINED", "PENDING"}


def add_participants(
    user_id: int,
    event_id: int,
    participant_user_ids: list[int],
) -> list[int]:
    """
    params: $1 user_id (owner), $2 event_id, $3 user_ids int[]
    returns: list of user_ids actually added
    """
    rows = fetch_all(
        CATEGORY,
        "add_participants.sql",
        user_id,
        event_id,
        participant_user_ids,
        commit=True,
    )
    return [row["user_id"] for row in rows]


def get_participants(user_id: int, event_id: int) -> list[dict[str, Any]]:
    """params: $1 user_id, $2 event_id"""
    return fetch_all(CATEGORY, "get_participants.sql", user_id, event_id)


def get_pending_invitations(user_id: int, limit: int = 50) -> list[dict[str, Any]]:
    """params: $1 user_id, $2 limit"""
    return fetch_all(CATEGORY, "get_pending_invitations.sql", user_id, limit)


def get_rsvp_summary(user_id: int, event_id: int) -> list[dict[str, Any]]:
    """params: $1 user_id (owner), $2 event_id"""
    return fetch_all(CATEGORY, "get_rsvp_summary.sql", user_id, event_id)


def remove_participant(
    user_id: int,
    event_id: int,
    participant_user_id: int,
) -> dict[str, Any] | None:
    """params: $1 user_id, $2 event_id, $3 participant user_id"""
    return fetch_one(
        CATEGORY,
        "remove_participant.sql",
        user_id,
        event_id,
        participant_user_id,
        commit=True,
    )


def respond_to_invitation(
    user_id: int,
    event_id: int,
    status: RSVPStatus,
) -> dict[str, Any] | None:
    """params: $1 user_id, $2 event_id, $3 status ('ACCEPTED' | 'DECLINED' | 'PENDING')"""
    if status not in VALID_STATUSES:
        raise ValueError(f"Invalid RSVP status: {status}. Must be one of {VALID_STATUSES}")
    return fetch_one(
        CATEGORY,
        "respond_to_invitation.sql",
        user_id,
        event_id,
        status,
        commit=True,
    )
