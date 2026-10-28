-- remove_participant
-- params: $1 user_id (injected), $2 event_id, $3 participant user_id
-- returns: 0 rows = not allowed or not a participant. Allowed: owner removes anyone, or a participant removes themselves
DELETE FROM EventParticipants p
WHERE p.event_id = $2
  AND p.user_id  = $3
  AND (   $3 = $1
       OR EXISTS (SELECT 1 FROM Events e WHERE e.event_id = $2 AND e.user_id = $1))
RETURNING p.user_id;
