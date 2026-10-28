-- upsert_embedding
-- params: $1 event_id, $2 vector (text '[...]'), $3 model name. INTERNAL: util/background job only, never exposed to the LLM
-- returns: one row
INSERT INTO EventEmbeddings (event_id, vector_data, model, embedded_at)
VALUES ($1, $2::vector, $3, now())
ON CONFLICT (event_id) DO UPDATE
SET vector_data = EXCLUDED.vector_data,
    model       = EXCLUDED.model,
    embedded_at = now()
RETURNING embedding_id, event_id;
