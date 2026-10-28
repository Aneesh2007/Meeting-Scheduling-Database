-- get_frequent_collaborators
-- params: $1 user_id (injected), $2 range_start, $3 range_end, $4 limit
-- returns: people sharing the most events with the user (declined invites ignored)
WITH my_events AS (
  SELECT event_id
  FROM UserEvents
  WHERE viewer_id = $1
    AND start_time < $3
    AND end_time   > $2
),
people AS (
  SELECT e.event_id, e.user_id AS person_id
  FROM Events e
  JOIN my_events m ON m.event_id = e.event_id
  UNION ALL
  SELECT p.event_id, p.user_id
  FROM EventParticipants p
  JOIN my_events m ON m.event_id = p.event_id
  WHERE p.status <> 'DECLINED'
)
SELECT u.user_id, u.username, count(*) AS shared_events
FROM people pe
JOIN Users u ON u.user_id = pe.person_id
WHERE pe.person_id <> $1
GROUP BY u.user_id, u.username
ORDER BY shared_events DESC, u.username
LIMIT $4;
