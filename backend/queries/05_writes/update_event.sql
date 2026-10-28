-- update_event
-- params: $1 user_id (injected), $2 event_id, $3 title, $4 description, $5 start, $6 end (all nullable; NULL = keep current)
-- returns: 0 rows = not found or not owner. Use description = '' to clear it. If title/description changed, re-embed (see get_events_missing_embeddings)
UPDATE Events
SET title       = COALESCE($3, title),
    description = COALESCE($4, description),
    start_time  = COALESCE($5, start_time),
    end_time    = COALESCE($6, end_time),
    updated_at  = now()
WHERE event_id = $2
  AND user_id  = $1
RETURNING event_id, title, description, start_time, end_time;
