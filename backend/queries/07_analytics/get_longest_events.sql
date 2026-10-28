-- get_longest_events
-- params: $1 user_id (injected), $2 range_start, $3 range_end, $4 limit
-- returns: longest events first
SELECT event_id, title, start_time, end_time,
       round(extract(epoch FROM (end_time - start_time)) / 60.0) AS duration_minutes
FROM UserEvents
WHERE viewer_id = $1
  AND start_time < $3
  AND end_time   > $2
ORDER BY end_time - start_time DESC
LIMIT $4;
