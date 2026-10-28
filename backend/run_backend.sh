#!/bin/sh

DB_NAME=meetingwise DB_USER=meetingwise DB_PASSWORD=meetingwise \
  python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

