-- get_back_to_back_events
-- params: $1 user_id (injected), $2 range_start, $3 range_end, $4 max_gap interval (e.g. '0 minutes' or '10 minutes')
-- returns: consecutive event pairs separated by at most max_gap (no overlap)
WITH ordered AS (
  SELECT event_id, title, start_time, end_time,
         LEAD(event_id)   OVER w AS next_event_id,
         LEAD(title)      OVER w AS next_title,
         LEAD(start_time) OVER w AS next_start
  FROM UserEvents
  WHERE viewer_id = $1
    AND start_time < $3
    AND end_time   > $2
  WINDOW w AS (ORDER BY start_time, end_time)
)
SELECT event_id, title, end_time,
       next_event_id, next_title, next_start,
       next_start - end_time AS gap
FROM ordered
WHERE next_start IS NOT NULL
  AND next_start >= end_time
  AND next_start - end_time <= $4::interval
ORDER BY start_time;
