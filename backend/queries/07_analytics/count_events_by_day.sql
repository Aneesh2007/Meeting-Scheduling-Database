-- count_events_by_day
-- params: $1 user_id (injected), $2 range_start, $3 range_end, $4 IANA timezone
-- returns: events per local day
SELECT date_trunc('day', start_time AT TIME ZONE $4)::date AS day,
       count(*) AS n_events
FROM UserEvents
WHERE viewer_id = $1
  AND start_time >= $2
  AND start_time <  $3
GROUP BY 1
ORDER BY 1;
