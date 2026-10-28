-- respond_to_invitation
-- params: $1 user_id (injected), $2 event_id, $3 status: ACCEPTED | DECLINED | PENDING
-- returns: 0 rows = user was never invited. Validate $3 in util code (CHECK constraint is the backstop)
UPDATE EventParticipants
SET status = $3
WHERE event_id = $2
  AND user_id  = $1
RETURNING event_id, status;
