from __future__ import annotations

import os
import re
import time
from datetime import datetime
from typing import Any
from uuid import UUID

import psycopg
from psycopg.rows import dict_row
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")
if not DATABASE_URL:
    # Allow the app to start for UI development, but database routes will return a clear error.
    DATABASE_URL = ""

app = FastAPI(title="MeetWise AI API", version="0.1.0")

origins = [x.strip() for x in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if x.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Demo-only in-memory query trace. For multi-worker deployment, store query events in PostgreSQL.
query_events: list[dict[str, Any]] = []
MAX_QUERY_EVENTS = 100


def db_connect():
    if not DATABASE_URL:
        raise HTTPException(status_code=503, detail="DATABASE_URL is not configured. Set it in backend/.env.")
    return psycopg.connect(DATABASE_URL, row_factory=dict_row)


def execute(sql: str, params: tuple = (), *, fetch: str = "all"):
    """Execute a parameterized query and record a safe, explainable trace for the UI."""
    started = time.perf_counter()
    try:
        with db_connect() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, params)
                if fetch == "one":
                    result = cur.fetchone()
                    row_count = 1 if result else 0
                elif fetch == "none":
                    result = None
                    row_count = cur.rowcount
                else:
                    result = cur.fetchall()
                    row_count = len(result)
        elapsed_ms = round((time.perf_counter() - started) * 1000, 2)
        query_events.insert(0, {
            "id": int(time.time() * 1000),
            "sql": sql.strip(),
            "parameters": [str(p) if isinstance(p, (UUID, datetime)) else p for p in params],
            "elapsed_ms": elapsed_ms,
            "row_count": row_count,
            "success": True,
        })
        del query_events[MAX_QUERY_EVENTS:]
        return result
    except HTTPException:
        raise
    except Exception as exc:
        query_events.insert(0, {
            "id": int(time.time() * 1000),
            "sql": sql.strip(),
            "parameters": [str(p) if isinstance(p, (UUID, datetime)) else p for p in params],
            "elapsed_ms": round((time.perf_counter() - started) * 1000, 2),
            "row_count": 0,
            "success": False,
            "error": str(exc),
        })
        del query_events[MAX_QUERY_EVENTS:]
        raise


class MeetingCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    organizer_id: UUID
    participant_ids: list[UUID] = []
    starts_at: datetime
    ends_at: datetime
    room_id: UUID | None = None


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


@app.get("/api/health")
def health():
    return {"status": "ok", "database_configured": bool(DATABASE_URL)}


@app.get("/api/query-events")
def get_query_events():
    return {"events": query_events[:30]}


@app.get("/api/users")
def list_users():
    rows = execute(
        "SELECT user_id, full_name, email FROM app_users ORDER BY full_name",
    )
    return {"users": rows}


@app.get("/api/meetings")
def list_meetings(start: datetime | None = None, end: datetime | None = None):
    if start and end and end <= start:
        raise HTTPException(status_code=400, detail="end must be later than start")
    sql = """
        SELECT m.meeting_id, m.title, m.description, m.starts_at, m.ends_at,
               m.status, m.room_id, r.room_name,
               u.full_name AS organizer_name,
               COALESCE(
                 json_agg(json_build_object('user_id', p.user_id, 'full_name', pu.full_name))
                   FILTER (WHERE p.user_id IS NOT NULL), '[]'::json
               ) AS participants
        FROM meetings m
        JOIN app_users u ON u.user_id = m.organizer_id
        LEFT JOIN rooms r ON r.room_id = m.room_id
        LEFT JOIN meeting_participants p ON p.meeting_id = m.meeting_id
        LEFT JOIN app_users pu ON pu.user_id = p.user_id
        WHERE m.status = 'scheduled'
          AND (%s::timestamptz IS NULL OR m.ends_at > %s)
          AND (%s::timestamptz IS NULL OR m.starts_at < %s)
        GROUP BY m.meeting_id, u.full_name, r.room_name
        ORDER BY m.starts_at
    """
    rows = execute(sql, (start, start, end, end))
    return {"meetings": rows}


@app.post("/api/meetings")
def create_meeting(body: MeetingCreate):
    if body.ends_at <= body.starts_at:
        raise HTTPException(status_code=400, detail="Meeting end must be after start.")
    participant_ids = list(dict.fromkeys(body.participant_ids + [body.organizer_id]))

    # One transaction: check participant conflicts, insert meeting, insert participants.
    try:
        with db_connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                     SELECT DISTINCT u.user_id, u.full_name, m.title, m.starts_at, m.ends_at
                     FROM meetings m
                     JOIN meeting_participants mp ON mp.meeting_id = m.meeting_id
                     JOIN app_users u ON u.user_id = mp.user_id
                     WHERE mp.user_id = ANY(%s)
                     AND m.status = 'scheduled'
                     AND m.starts_at < %s AND m.ends_at > %s
                    """,
                    (participant_ids, body.ends_at, body.starts_at),
                )
                conflicts = cur.fetchall()
                if conflicts:
                    raise HTTPException(status_code=409, detail={
                        "message": "One or more participants already have a meeting in this time range.",
                        "conflicts": conflicts,
                    })

                cur.execute(
                    """
                    INSERT INTO meetings (title, description, organizer_id, room_id, starts_at, ends_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING meeting_id, title, description, organizer_id, room_id, starts_at, ends_at, status
                    """,
                    (body.title, body.description, body.organizer_id, body.room_id, body.starts_at, body.ends_at),
                )
                meeting = cur.fetchone()
                cur.executemany(
                    """
                    INSERT INTO meeting_participants (meeting_id, user_id, participant_role)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (meeting_id, user_id) DO NOTHING
                    """,
                    [(meeting["meeting_id"], uid, "organizer" if uid == body.organizer_id else "attendee")
                     for uid in participant_ids],
                )
        # Record high-level transaction trace; SQL templates are also visible in the source.
        query_events.insert(0, {
            "id": int(time.time() * 1000),
            "sql": "-- Transaction: participant conflict check + INSERT meetings + INSERT meeting_participants",
            "parameters": {
                "title": body.title,
                "organizer_id": str(body.organizer_id),
                "participant_ids": [str(x) for x in participant_ids],
                "starts_at": body.starts_at.isoformat(),
                "ends_at": body.ends_at.isoformat(),
            },
            "elapsed_ms": None,
            "row_count": 1,
            "success": True,
        })
        del query_events[MAX_QUERY_EVENTS:]
        return {"meeting": meeting}
    except HTTPException:
        raise
    
    

@app.post("/api/chat")
def chat(body: ChatRequest):
    """
    Initial transparent intent parser. Replace this with an LLM structured-output call.
    It intentionally does not generate or execute arbitrary SQL.
    """
    message = body.message.strip()
    low = message.lower()
    if any(word in low for word in ("show", "list", "retrieve", "find my", "what meetings")):
        rows = execute(
            """SELECT m.meeting_id, m.title, m.starts_at, m.ends_at, m.status
               FROM meetings m WHERE m.status = 'scheduled'
               ORDER BY m.starts_at LIMIT 20"""
        )
        return {
            "reply": f"I found {len(rows)} scheduled meeting(s). The results are shown below.",
            "intent": "list_meetings",
            "data": rows,
            "note": "This starter uses a rule-based parser. LLM structured output will be added next.",
        }
    if any(word in low for word in ("schedule", "book", "create", "set up", "arrange")):
        return {
            "reply": "I can help schedule that. Please use the New Meeting form to confirm the title, participants, start and end times. The backend will check conflicts before saving.",
            "intent": "create_meeting",
            "data": None,
            "note": "Next step: connect an LLM that extracts these fields into a validated JSON action.",
        }
    return {
        "reply": "Try asking me to list meetings, or describe a meeting you want to schedule. I will check the database before confirming any change.",
        "intent": "help",
        "data": None,
    }
