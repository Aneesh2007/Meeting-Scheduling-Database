"""Team utility adapter wiring chatbot actions to the events_write service."""

from typing import Any

from app.services import events_write


class TeamUtilityAdapter:
    async def create_event(self, *, user_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        return events_write.create_event(
            user_id=user_id,
            title=payload["title"],
            description=payload.get("description"),
            start=payload["start_time"],
            end=payload["end_time"],
            participant_ids=payload.get("participant_ids"),
        )

    async def update_event(
        self, *, user_id: int, event_id: int, payload: dict[str, Any]
    ) -> dict[str, Any]:
        return events_write.update_event(
            user_id=user_id,
            event_id=event_id,
            title=payload.get("title"),
            description=payload.get("description"),
            start=payload.get("start_time"),
            end=payload.get("end_time"),
        )

    async def delete_event(self, *, user_id: int, event_id: int) -> dict[str, Any]:
        return events_write.delete_event(user_id=user_id, event_id=event_id)
