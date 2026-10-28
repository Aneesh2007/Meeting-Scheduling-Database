"""Participant / RSVP endpoints."""

from typing import Any, Literal
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.services import participants

router = APIRouter(prefix="/events", tags=["Participants"])

RSVPStatus = Literal["ACCEPTED", "DECLINED", "PENDING"]


class AddParticipantsRequest(BaseModel):
    participant_user_ids: list[int]


class RespondInvitationRequest(BaseModel):
    status: RSVPStatus


@router.get("/{event_id}/participants")
def get_participants(event_id: int, user_id: int = Query(..., gt=0)):
    return participants.get_participants(user_id=user_id, event_id=event_id)


@router.post("/{event_id}/participants")
def add_participants(
    event_id: int,
    user_id: int = Query(..., gt=0),
    payload: AddParticipantsRequest = None,
):
    added = participants.add_participants(
        user_id=user_id,
        event_id=event_id,
        participant_user_ids=payload.participant_user_ids,
    )
    return {"added": added}


@router.delete("/{event_id}/participants/{participant_user_id}")
def remove_participant(
    event_id: int,
    participant_user_id: int,
    user_id: int = Query(..., gt=0),
):
    result = participants.remove_participant(
        user_id=user_id,
        event_id=event_id,
        participant_user_id=participant_user_id,
    )

    if result is None:
        raise HTTPException(status_code=404, detail="Participant not found or not removable.")

    return result


@router.put("/{event_id}/respond")
def respond_to_invitation(
    event_id: int,
    user_id: int = Query(..., gt=0),
    payload: RespondInvitationRequest = None,
):
    result = participants.respond_to_invitation(
        user_id=user_id,
        event_id=event_id,
        status=payload.status,
    )

    if result is None:
        raise HTTPException(status_code=404, detail="Invitation not found.")

    return result
