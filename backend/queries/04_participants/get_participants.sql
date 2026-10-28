-- get_participants
-- params: $1 user_id (injected), $2 event_id
-- returns: owner + participants with RSVP status; empty if the requester cannot see the event
SELECT u.user_id, u.username, u.email, 'OWNER' AS role, 'ACCEPTED' AS status
FROM Events e
JOIN Users u ON u.user_id = e.user_id
WHERE e.event_id = $2
  AND EXISTS (SELECT 1 FROM UserEvents ue WHERE ue.viewer_id = $1 AND ue.event_id = $2)
UNION ALL
SELECT u.user_id, u.username, u.email, 'PARTICIPANT', p.status
FROM EventParticipants p
JOIN Users u ON u.user_id = p.user_id
WHERE p.event_id = $2
  AND EXISTS (SELECT 1 FROM UserEvents ue WHERE ue.viewer_id = $1 AND ue.event_id = $2);
