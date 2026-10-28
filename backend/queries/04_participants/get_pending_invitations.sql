-- get_pending_invitations
-- params: $1 user_id (injected), $2 limit
-- returns: future events the user was invited to but has not answered
SELECT ue.event_id, ue.title, ue.start_time, ue.end_time,
       u.user_id AS owner_id, u.username AS owner_username
FROM UserEvents ue
JOIN Users u ON u.user_id = ue.owner_id
WHERE ue.viewer_id = $1
  AND ue.role   = 'PARTICIPANT'
  AND ue.status = 'PENDING'
  AND ue.end_time > now()
ORDER BY ue.start_time
LIMIT $2;
