-- delete_event
-- params: $1 user_id (injected), $2 event_id
-- returns: 0 rows = not found or not owner. ON DELETE CASCADE removes participants, calendar entries and embedding
DELETE FROM Events
WHERE event_id = $2
  AND user_id  = $1
RETURNING event_id, title, start_time, end_time;
