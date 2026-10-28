-- search_events_text
-- params: $1 user_id (injected), $2 keyword, $3 range_start (nullable), $4 range_end (nullable), $5 limit
-- returns: keyword matches in title/description. strpos is used instead of ILIKE so %/_ in user input cannot act as wildcards
SELECT event_id, owner_id, title, start_time, end_time, role, status
FROM UserEvents
WHERE viewer_id = $1
  AND (   strpos(lower(title), lower($2)) > 0
       OR strpos(lower(coalesce(description, '')), lower($2)) > 0)
  AND ($3::timestamptz IS NULL OR end_time   > $3)
  AND ($4::timestamptz IS NULL OR start_time < $4)
ORDER BY start_time
LIMIT $5;
