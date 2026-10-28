CREATE EXTENSION IF NOT EXISTS pgcrypto; 
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE Users (
    user_id  SERIAL PRIMARY KEY,
    username VARCHAR(50)  UNIQUE NOT NULL,
    email    VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,  never plaintext
    timezone TEXT NOT NULL DEFAULT 'UTC'   
);

CREATE TABLE Events (
    event_id    SERIAL PRIMARY KEY,
    user_id     INT NOT NULL
        REFERENCES Users(user_id)
        ON DELETE CASCADE,  
    title       VARCHAR(100) NOT NULL,
    description TEXT,
    start_time  TIMESTAMPTZ NOT NULL,
    end_time    TIMESTAMPTZ NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(), 
    CONSTRAINT events_time_order CHECK (end_time > start_time)
);

CREATE TABLE EventParticipants (
    event_id INT NOT NULL
        REFERENCES Events(event_id)
        ON DELETE CASCADE,
    user_id  INT NOT NULL
        REFERENCES Users(user_id)
        ON DELETE CASCADE,
    status   VARCHAR(20) NOT NULL DEFAULT 'PENDING',  
    PRIMARY KEY (event_id, user_id),
    CONSTRAINT participants_status_valid
        CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED'))
);

CREATE TABLE UserCalendar (
    calendar_entry_id SERIAL PRIMARY KEY,
    user_id  INT NOT NULL
        REFERENCES Users(user_id)
        ON DELETE CASCADE,
    event_id INT NOT NULL
        REFERENCES Events(event_id)
        ON DELETE CASCADE,
    CONSTRAINT usercalendar_user_event_unique UNIQUE (user_id, event_id)
);

CREATE TABLE EventEmbeddings (
    embedding_id SERIAL PRIMARY KEY,
    event_id     INT UNIQUE NOT NULL
        REFERENCES Events(event_id)
        ON DELETE CASCADE,
    vector_data  vector(1536) NOT NULL,
    model        TEXT, 
    embedded_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_users_email_lower    ON Users (lower(email)); 
CREATE UNIQUE INDEX idx_users_username_lower ON Users (lower(username));
CREATE INDEX idx_events_user_start        ON Events (user_id, start_time);
CREATE INDEX idx_events_start_end         ON Events (start_time, end_time);
CREATE INDEX idx_participants_user_status ON EventParticipants (user_id, status);
CREATE INDEX idx_usercalendar_user        ON UserCalendar (user_id);
CREATE INDEX idx_event_embeddings_hnsw
    ON EventEmbeddings USING hnsw (vector_data vector_cosine_ops);