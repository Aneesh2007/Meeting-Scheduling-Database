-- reschedule_event
-- params: $1 user_id (injected), $2 event_id, $3 new_start, $4 new_end
-- returns: one row: event_id, participants_reset. Resets all RSVPs to PENDING. Run check_conflicts first
WITH moved AS (
  UPDATE Events
  SET start_time = $3,
      end_time   = $4,
      updated_at = now()
  WHERE event_id = $2
    AND user_id  = $1
  RETURNING event_id
),
reset AS (
  UPDATE EventParticipants
  SET status = 'PENDING'
  WHERE event_id IN (SELECT event_id FROM moved)
  RETURNING user_id
)
SELECT m.event_id,
       (SELECT count(*) FROM reset) AS participants_reset
FROM moved m;
