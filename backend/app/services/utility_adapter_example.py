"""Example adapter. Replace imports with the actual teammate-owned service functions.

Do NOT point the chatbot at raw SQL or let the model execute query files. Each service
must enforce ownership, parameterize SQL, invoke the DB's conflict triggers, and refresh
embeddings after title/description changes.
"""
from typing import Any

class TeamUtilityAdapter:
    def __init__(self, create_fn, update_fn, delete_fn):
        self._create_fn = create_fn
        self._update_fn = update_fn
        self._delete_fn = delete_fn

    async def create_event(self, *, user_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        return await self._create_fn(user_id=user_id, **payload)

    async def update_event(self, *, user_id: int, event_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        return await self._update_fn(user_id=user_id, event_id=event_id, **payload)

    async def delete_event(self, *, user_id: int, event_id: int) -> dict[str, Any]:
        return await self._delete_fn(user_id=user_id, event_id=event_id)
