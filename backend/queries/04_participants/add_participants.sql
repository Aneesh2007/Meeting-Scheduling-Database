-- add_participants
-- params: $1 user_id (injected), $2 event_id, $3 user_ids int[]
-- returns: user_ids actually added (owner only; owner and unknown/duplicate ids skipped)
INSERT INTO EventParticipants (event_id, user_id)
SELECT e.event_id, u.user_id
FROM Events e
JOIN Users u ON u.user_id = ANY($3::int[])
WHERE e.event_id = $2
  AND e.user_id  = $1
  AND u.user_id <> e.user_id
ON CONFLICT (event_id, user_id) DO NOTHING
RETURNING user_id;
