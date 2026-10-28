-- get_events_i_own
-- params: $1 user_id (injected), $2 range_start (nullable), $3 range_end (nullable), $4 limit
-- returns: only events the user owns
SELECT event_id, title, description, start_time, end_time, updated_at
FROM Events
WHERE user_id = $1
  AND ($2::timestamptz IS NULL OR end_time   > $2)
  AND ($3::timestamptz IS NULL OR start_time < $3)
ORDER BY start_time
LIMIT $4;
