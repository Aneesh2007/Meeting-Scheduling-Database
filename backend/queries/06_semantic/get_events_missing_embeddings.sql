-- get_events_missing_embeddings
-- params: $1 batch limit. INTERNAL: backfill/re-embed job, not for the LLM
-- returns: events with no embedding or an embedding older than the last edit
SELECT e.event_id, e.title, e.description
FROM Events e
LEFT JOIN EventEmbeddings v ON v.event_id = e.event_id
WHERE v.event_id IS NULL
   OR v.embedded_at < e.updated_at
ORDER BY e.updated_at
LIMIT $1;
