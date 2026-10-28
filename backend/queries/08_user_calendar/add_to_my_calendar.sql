-- add_to_my_calendar
-- params: $1 user_id (injected), $2 event_id
-- returns: 0 rows = event not visible to the user or already added
INSERT INTO UserCalendar (user_id, event_id)
SELECT $1, ue.event_id
FROM UserEvents ue
WHERE ue.viewer_id = $1
  AND ue.event_id  = $2
ON CONFLICT (user_id, event_id) DO NOTHING
RETURNING calendar_entry_id, event_id;
