-- get_double_booked_events
-- params: $1 user_id (injected), $2 range_start, $3 range_end, $4 limit
-- returns: pairs of the user's own events that overlap each other
SELECT a.event_id AS event_a_id, a.title AS event_a_title, a.start_time AS a_start, a.end_time AS a_end,
       b.event_id AS event_b_id, b.title AS event_b_title, b.start_time AS b_start, b.end_time AS b_end
FROM UserEvents a
JOIN UserEvents b
  ON  b.viewer_id  = a.viewer_id
  AND b.event_id   > a.event_id
  AND b.start_time < a.end_time
  AND b.end_time   > a.start_time
WHERE a.viewer_id  = $1
  AND a.start_time < $3
  AND a.end_time   > $2
ORDER BY a.start_time
LIMIT $4;
