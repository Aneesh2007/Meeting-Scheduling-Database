
from fastapi import FastAPI

from app.api.users import router as users_router
from app.api.chat import router as chat_router
from app.database import lifespan
from app.services.chatbot import configure_utility_adapters
from app.services.chatbot_adapter import TeamUtilityAdapter


# Connect the chatbot to the existing event-management utilities.
configure_utility_adapters(TeamUtilityAdapter())


app = FastAPI(
    title="MeetingWise Backend",
    lifespan=lifespan,
)

# Register API routes.
app.include_router(users_router)
app.include_router(chat_router)


@app.get("/health")
def health():
    return {"status": "ok"}