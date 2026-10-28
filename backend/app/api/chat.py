"""HTTP endpoints for the MeetingWise LLM assistant."""
from fastapi import APIRouter
from app.services.chatbot import ChatRequest, chat

router = APIRouter(prefix="/chat", tags=["Chat assistant"])

@router.post("")
async def chat_endpoint(request: ChatRequest):
    """Send one message to the assistant. Mutations are proposed, not executed."""
    return await chat(request=request)
