-- get_events_on_date
-- params: $1 user_id (injected), $2 date, $3 IANA timezone (e.g. Asia/Kolkata), $4 limit
-- returns: events touching that local calendar day
SELECT event_id, owner_id, title, start_time, end_time, role, status
FROM UserEvents
WHERE viewer_id = $1
  AND start_time < (($2::date + 1)::timestamp AT TIME ZONE $3)
  AND end_time   > ( $2::date::timestamp      AT TIME ZONE $3)
ORDER BY start_time
LIMIT $4;
