-- bulk_move_events
-- params: $1 user_id (injected), $2 range_start, $3 range_end, $4 shift interval
-- returns: one row: events_moved, participants_reset. Only moves events the user OWNS whose start is in the range. Single statement = atomic
WITH moved AS (
  UPDATE Events
  SET start_time = start_time + $4::interval,
      end_time   = end_time   + $4::interval,
      updated_at = now()
  WHERE user_id = $1
    AND start_time >= $2
    AND start_time <  $3
  RETURNING event_id
),
reset AS (
  UPDATE EventParticipants
  SET status = 'PENDING'
  WHERE event_id IN (SELECT event_id FROM moved)
  RETURNING 1
)
SELECT (SELECT count(*) FROM moved) AS events_moved,
       (SELECT count(*) FROM reset) AS participants_reset;
