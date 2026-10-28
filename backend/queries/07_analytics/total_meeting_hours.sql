-- total_meeting_hours
-- params: $1 user_id (injected), $2 range_start, $3 range_end
-- returns: one row: hours, n_events. Durations clipped to the range. Overlapping events are double-counted
SELECT round((coalesce(sum(extract(epoch FROM (LEAST(end_time, $3) - GREATEST(start_time, $2)))), 0) / 3600.0)::numeric, 2) AS hours,
       count(*) AS n_events
FROM UserEvents
WHERE viewer_id = $1
  AND start_time < $3
  AND end_time   > $2;
