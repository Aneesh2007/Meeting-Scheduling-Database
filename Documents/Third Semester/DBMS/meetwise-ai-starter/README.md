# MeetWise AI — DBMS Course Project Starter

AI-assisted meeting scheduling with a React calendar, FastAPI backend, Supabase PostgreSQL, pgvector, conflict detection, and a SQL query inspector.

## Architecture
- `frontend/`: React + TypeScript + Vite UI (calendar-style weekly view, chatbot, SQL inspector)
- `backend/`: FastAPI API, PostgreSQL access via psycopg, meeting validation and conflict detection
- `database/schema.sql`: normalized relational schema, constraints, indexes, exclusion constraint, pgvector table
- `database/demo.sql`: demo seed data

## 1. Create the Supabase database
1. Create a Supabase project.
2. Open **SQL Editor** and run `database/schema.sql`.
3. Optionally run `database/demo.sql`.
4. Copy the database connection string from Supabase (use the direct or session pooler connection suitable for your environment).

## 2. Run the backend
```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
# Set DATABASE_URL in .env
uvicorn app.main:app --reload
```
Backend docs: http://127.0.0.1:8000/docs

## 3. Run the frontend
```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```
Set `VITE_API_URL=http://127.0.0.1:8000` in `frontend/.env`.

## Notes
- This is a starter scaffold, not a production deployment.
- The initial chat endpoint uses a transparent, rule-based intent parser so the core scheduling/database path works before an LLM is connected. Replace it with an LLM structured-output call in `backend/app/main.py`; keep all validation and database writes server-side.
- SQL inspector events are created by the backend query wrapper and include the SQL template, parameters, elapsed time, and row count. Never display credentials or raw connection strings.
- For production, add authentication, authorization, rate limiting, input validation, proper tenant isolation, and Supabase Row Level Security.
- PostgreSQL's `btree_gist` extension and exclusion constraint prevent overlapping meetings for the same room. Participant conflicts are checked in the backend; to make participant-level conflict prevention fully race-safe, add a participant-time exclusion design or serialize writes for the relevant participants in a transaction.
