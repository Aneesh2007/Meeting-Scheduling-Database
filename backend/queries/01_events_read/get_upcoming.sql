-- get_upcoming
-- params: $1 user_id (injected), $2 limit
-- returns: ongoing + future events, soonest first
SELECT event_id, owner_id, title, start_time, end_time, role, status
FROM UserEvents
WHERE viewer_id = $1
  AND end_time > now()
ORDER BY start_time
LIMIT $2;
