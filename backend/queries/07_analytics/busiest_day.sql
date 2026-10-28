-- busiest_day
-- params: $1 user_id (injected), $2 range_start, $3 range_end, $4 IANA timezone
-- returns: 0..1 row: the local day with most events (ties broken by hours booked)
SELECT date_trunc('day', start_time AT TIME ZONE $4)::date AS day,
       count(*) AS n_events,
       round((sum(extract(epoch FROM (end_time - start_time))) / 3600.0)::numeric, 2) AS hours
FROM UserEvents
WHERE viewer_id = $1
  AND start_time >= $2
  AND start_time <  $3
GROUP BY 1
ORDER BY n_events DESC, hours DESC
LIMIT 1;
