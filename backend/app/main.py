
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.users import router as users_router
from app.api.events import router as events_router
from app.api.participants import router as participants_router
from app.api.invitations import router as invitations_router
from app.api.calendar import router as calendar_router
from app.api.availability import router as availability_router
from app.api.analytics import router as analytics_router
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

# CORS for frontend dev server (Vite on :5173) calling backend on :8000.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes.
app.include_router(users_router)
app.include_router(events_router)
app.include_router(participants_router)
app.include_router(invitations_router)
app.include_router(calendar_router)
app.include_router(availability_router)
app.include_router(analytics_router)
app.include_router(chat_router)


@app.get("/health")
def health():
    return {"status": "ok"}