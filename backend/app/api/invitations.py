"""Invitation endpoints."""

from typing import Optional
from fastapi import APIRouter, Query

from app.services import participants

router = APIRouter(prefix="/invitations", tags=["Invitations"])


@router.get("/pending")
def get_pending_invitations(
    user_id: int = Query(..., gt=0),
    limit: int = Query(50, ge=1, le=200),
):
    """Future events the user was invited to but has not answered."""
    return participants.get_pending_invitations(user_id=user_id, limit=limit)


@router.get("/rsvp-summary")
def get_rsvp_summary(
    event_id: int,
    user_id: int = Query(..., gt=0),
):
    """RSVP summary for an event (owner only)."""
    return participants.get_rsvp_summary(user_id=user_id, event_id=event_id)
