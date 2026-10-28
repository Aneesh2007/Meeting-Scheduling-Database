-- duplicate_event
-- params: $1 user_id (injected), $2 source event_id (must be owned), $3 new_start
-- returns: new event with same title/description/duration. Participants are NOT copied; call add_participants after
INSERT INTO Events (user_id, title, description, start_time, end_time)
SELECT $1, e.title, e.description, $3::timestamptz, $3::timestamptz + (e.end_time - e.start_time)
FROM Events e
WHERE e.event_id = $2
  AND e.user_id  = $1
RETURNING event_id, title, start_time, end_time;
