-- get_event
-- params: $1 user_id (injected), $2 event_id
-- returns: 0..1 row
SELECT event_id, owner_id, title, description, start_time, end_time, role, status
FROM UserEvents
WHERE viewer_id = $1 AND event_id = $2;
