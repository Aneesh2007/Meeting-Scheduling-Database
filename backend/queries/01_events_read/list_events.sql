-- list_events
-- params: $1 user_id (injected), $2 range_start, $3 range_end, $4 limit
-- returns: events overlapping the range, chronological
SELECT event_id, owner_id, title, start_time, end_time, role, status
FROM UserEvents
WHERE viewer_id = $1
  AND ($2::timestamptz IS NULL OR end_time   > $2)
  AND ($3::timestamptz IS NULL OR start_time < $3)
ORDER BY start_time
LIMIT $4;
