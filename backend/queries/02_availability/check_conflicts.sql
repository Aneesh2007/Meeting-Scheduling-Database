-- check_conflicts
-- params: $1 user_id (injected), $2 start, $3 end, $4 exclude_event_id (nullable)
-- returns: every event overlapping [start,end). Caller decides whether PENDING counts as a conflict via the status column
SELECT event_id, title, start_time, end_time, role, status
FROM UserEvents
WHERE viewer_id = $1
  AND start_time < $3
  AND end_time   > $2
  AND event_id IS DISTINCT FROM $4::int
ORDER BY start_time;
