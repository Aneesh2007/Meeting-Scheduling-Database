-- find_similar_events
-- params: $1 user_id (injected), $2 event_id, $3 k
-- returns: events most similar to the given one (must be visible to the user)
WITH src AS (
  SELECT v.vector_data
  FROM EventEmbeddings v
  JOIN UserEvents ue ON ue.event_id = v.event_id
  WHERE ue.viewer_id = $1
    AND v.event_id   = $2
)
SELECT ue.event_id, ue.title, ue.start_time, ue.end_time,
       1 - (v.vector_data <=> (SELECT vector_data FROM src)) AS similarity
FROM EventEmbeddings v
JOIN UserEvents ue ON ue.event_id = v.event_id
WHERE ue.viewer_id = $1
  AND v.event_id  <> $2
  AND EXISTS (SELECT 1 FROM src)
ORDER BY v.vector_data <=> (SELECT vector_data FROM src)
LIMIT $3;
