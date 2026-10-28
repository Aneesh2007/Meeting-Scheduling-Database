-- remove_from_my_calendar
-- params: $1 user_id (injected), $2 event_id
-- returns: 0 rows = nothing to remove
DELETE FROM UserCalendar
WHERE user_id  = $1
  AND event_id = $2
RETURNING calendar_entry_id, event_id;
