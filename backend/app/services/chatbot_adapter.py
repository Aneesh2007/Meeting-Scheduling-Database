
"""Connect the MeetingWise chatbot to the existing event services."""

from typing import Any

from fastapi import HTTPException
from starlette.concurrency import run_in_threadpool

from app.services import events_write


class TeamUtilityAdapter:
    """Adapter between LLM-proposed actions and existing event utilities."""

    async def create_event(
        self,
        *,
        user_id: int,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        """Create an event using the existing database service."""

        title = payload.get("title")
        start = payload.get("start_time", payload.get("start"))
        end = payload.get("end_time", payload.get("end"))
        description = payload.get("description")
        participant_ids = payload.get("participant_ids", [])

        if not isinstance(title, str) or not title.strip():
            raise HTTPException(
                status_code=422,
                detail="A non-empty event title is required.",
            )

        if len(title) > 100:
            raise HTTPException(
                status_code=422,
                detail="Event titles cannot exceed 100 characters.",
            )

        if not start or not end:
            raise HTTPException(
                status_code=422,
                detail="Creating an event requires a start time and end time.",
            )

        if not isinstance(participant_ids, list):
            raise HTTPException(
                status_code=422,
                detail="participant_ids must be a list of user IDs.",
            )

        if any(
            isinstance(participant_id, bool)
            or not isinstance(participant_id, int)
            or participant_id <= 0
            for participant_id in participant_ids
        ):
            raise HTTPException(
                status_code=422,
                detail="Participant IDs must be positive integers.",
            )

        result = await run_in_threadpool(
            events_write.create_event,
            user_id=user_id,
            title=title.strip(),
            description=description,
            start=start,
            end=end,
            participant_ids=participant_ids,
        )

        if result is None:
            raise HTTPException(
                status_code=400,
                detail="The event could not be created.",
            )

        return result

    async def update_event(
        self,
        *,
        user_id: int,
        event_id: int,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        """Update an event using the existing database service."""

        allowed_fields = {
            "title",
            "description",
            "start_time",
            "end_time",
            "start",
            "end",
        }

        unexpected_fields = set(payload) - allowed_fields
        if unexpected_fields:
            raise HTTPException(
                status_code=422,
                detail=(
                    "Unsupported event fields: "
                    + ", ".join(sorted(unexpected_fields))
                ),
            )

        title = payload.get("title")
        if title is not None:
            if not isinstance(title, str) or not title.strip():
                raise HTTPException(
                    status_code=422,
                    detail="The event title must be a non-empty string.",
                )
            if len(title) > 100:
                raise HTTPException(
                    status_code=422,
                    detail="Event titles cannot exceed 100 characters.",
                )
            title = title.strip()

        description = payload.get("description")
        start = payload.get("start_time", payload.get("start"))
        end = payload.get("end_time", payload.get("end"))

        if all(
            field is None
            for field in (title, description, start, end)
        ):
            raise HTTPException(
                status_code=422,
                detail="Provide at least one field to update.",
            )

        result = await run_in_threadpool(
            events_write.update_event,
            user_id=user_id,
            event_id=event_id,
            title=title,
            description=description,
            start=start,
            end=end,
        )

        if result is None:
            raise HTTPException(
                status_code=404,
                detail="The event could not be found or updated.",
            )

        return result

    async def delete_event(
        self,
        *,
        user_id: int,
        event_id: int,
    ) -> dict[str, Any]:
        """Delete an event using the existing database service."""

        result = await run_in_threadpool(
            events_write.delete_event,
            user_id=user_id,
            event_id=event_id,
        )

        if result is None:
            raise HTTPException(
                status_code=404,
                detail="The event could not be found or deleted.",
            )

        return result
