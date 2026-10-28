-- semantic_search
-- params: $1 user_id (injected), $2 query_vector (text like '[0.1,0.2,...]', 1536 dims, embedded by util layer), $3 k, $4 range_start (nullable), $5 range_end (nullable)
-- returns: top-k events by cosine similarity (1 = identical). With the HNSW index and filters, consider SET hnsw.iterative_scan = relaxed_order (pgvector 0.8+) so filtered queries still return k rows
SELECT ue.event_id, ue.title, ue.start_time, ue.end_time,
       1 - (v.vector_data <=> $2::vector) AS similarity
FROM EventEmbeddings v
JOIN UserEvents ue ON ue.event_id = v.event_id
WHERE ue.viewer_id = $1
  AND ($4::timestamptz IS NULL OR ue.end_time   > $4)
  AND ($5::timestamptz IS NULL OR ue.start_time < $5)
ORDER BY v.vector_data <=> $2::vector
LIMIT $3;
