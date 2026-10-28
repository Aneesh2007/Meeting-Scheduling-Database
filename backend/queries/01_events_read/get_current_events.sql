-- get_current_events
-- params: $1 user_id (injected)
-- returns: events happening right now
SELECT event_id, owner_id, title, start_time, end_time, role, status
FROM UserEvents
WHERE viewer_id = $1
  AND start_time <= now()
  AND end_time   >  now()
ORDER BY start_time;
