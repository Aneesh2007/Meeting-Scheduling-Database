-- preview_bulk_move_events
-- params: $1 user_id (injected), $2 range_start, $3 range_end, $4 shift interval (e.g. '1 hour', '-30 minutes')
-- returns: what bulk_move_events WOULD change. Show this to the user before applying
SELECT e.event_id, e.title,
       e.start_time, e.end_time,
       e.start_time + $4::interval AS new_start,
       e.end_time   + $4::interval AS new_end,
       (SELECT count(*) FROM EventParticipants p WHERE p.event_id = e.event_id) AS participants_affected
FROM Events e
WHERE e.user_id = $1
  AND e.start_time >= $2
  AND e.start_time <  $3
ORDER BY e.start_time;
