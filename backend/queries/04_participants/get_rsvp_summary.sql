-- get_rsvp_summary
-- params: $1 user_id (injected), $2 event_id
-- returns: one row per status; owner only
SELECT p.status, count(*) AS n
FROM EventParticipants p
WHERE p.event_id = $2
  AND EXISTS (SELECT 1 FROM Events e WHERE e.event_id = $2 AND e.user_id = $1)
GROUP BY p.status;
