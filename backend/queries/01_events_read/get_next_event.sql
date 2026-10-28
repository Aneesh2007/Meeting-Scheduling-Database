-- get_next_event
-- params: $1 user_id (injected)
-- returns: 0..1 row: next event that has not started yet
SELECT event_id, owner_id, title, description, start_time, end_time, role, status
FROM UserEvents
WHERE viewer_id = $1
  AND start_time >= now()
ORDER BY start_time
LIMIT 1;
