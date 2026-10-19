-- MeetWise AI database schema
-- Run in Supabase SQL Editor. PostgreSQL is the authoritative source of truth.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE meeting_status AS ENUM ('scheduled', 'cancelled', 'completed');

CREATE TABLE app_users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL CHECK (length(trim(full_name)) > 0),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rooms (
    room_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_name TEXT NOT NULL UNIQUE,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    location TEXT
);

CREATE TABLE meetings (
    meeting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    description TEXT,
    organizer_id UUID NOT NULL REFERENCES app_users(user_id) ON DELETE RESTRICT,
    room_id UUID REFERENCES rooms(room_id) ON DELETE RESTRICT,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    status meeting_status NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (ends_at > starts_at),
    -- Prevent two active meetings from occupying the same room at overlapping times.
    EXCLUDE USING gist (
        room_id WITH =,
        tstzrange(starts_at, ends_at, '[)') WITH &&
    ) WHERE (status = 'scheduled' AND room_id IS NOT NULL)
);

CREATE TABLE meeting_participants (
    meeting_id UUID NOT NULL REFERENCES meetings(meeting_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES app_users(user_id) ON DELETE RESTRICT,
    participant_role TEXT NOT NULL DEFAULT 'attendee'
        CHECK (participant_role IN ('organizer', 'attendee', 'optional')),
    response_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (response_status IN ('pending', 'accepted', 'declined')),
    PRIMARY KEY (meeting_id, user_id)
);

CREATE TABLE meeting_embeddings (
    embedding_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL UNIQUE REFERENCES meetings(meeting_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(384),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common scheduling and retrieval queries.
CREATE INDEX idx_meetings_start_status ON meetings (starts_at, status);
CREATE INDEX idx_meetings_organizer_start ON meetings (organizer_id, starts_at)
    WHERE status = 'scheduled';
CREATE INDEX idx_participants_user_meeting ON meeting_participants (user_id, meeting_id);
CREATE INDEX idx_rooms_capacity ON rooms (capacity);
CREATE INDEX idx_meeting_embeddings_vector ON meeting_embeddings
    USING hnsw (embedding vector_cosine_ops);

-- Keep updated_at fresh for meeting updates.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_meetings_updated_at
BEFORE UPDATE ON meetings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Demonstration view: scheduled meetings with organizer and room information.
CREATE VIEW scheduled_meeting_details AS
SELECT m.meeting_id, m.title, m.description, m.starts_at, m.ends_at,
       u.full_name AS organizer_name, r.room_name, m.status
FROM meetings m
JOIN app_users u ON u.user_id = m.organizer_id
LEFT JOIN rooms r ON r.room_id = m.room_id
WHERE m.status = 'scheduled';
