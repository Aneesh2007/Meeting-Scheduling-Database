-- list_calendar_entries
-- params: $1 user_id (injected), $2 limit
-- returns: UserCalendar rows. NOTE: UserCalendar currently duplicates UserEvents; keep these only if you give it its own meaning (bookmarks, per-user color/reminder)
SELECT uc.calendar_entry_id, e.event_id, e.title, e.start_time, e.end_time
FROM UserCalendar uc
JOIN Events e ON e.event_id = uc.event_id
WHERE uc.user_id = $1
ORDER BY e.start_time
LIMIT $2;
