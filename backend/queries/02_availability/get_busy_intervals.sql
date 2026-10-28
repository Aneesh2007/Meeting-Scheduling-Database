-- get_busy_intervals
-- params: $1 user_ids int[] (include the requester), $2 range_start, $3 range_end
-- returns: busy intervals per user, NO titles (privacy-safe for other users)
SELECT viewer_id AS user_id, start_time, end_time
FROM UserEvents
WHERE viewer_id = ANY($1)
  AND start_time < $3
  AND end_time   > $2
ORDER BY viewer_id, start_time;
