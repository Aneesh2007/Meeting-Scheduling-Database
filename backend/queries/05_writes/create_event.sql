-- create_event
-- params: $1 user_id (injected, becomes owner), $2 title, $3 description (nullable), $4 start, $5 end, $6 participant_ids int[] (use ARRAY[]::int[] for none)
-- returns: one row: event_id, title, description, start_time, end_time, participants_added. Run check_conflicts BEFORE this; embedding is created afterwards via upsert_embedding
WITH new_event AS (
  INSERT INTO Events (user_id, title, description, start_time, end_time)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING event_id, title, description, start_time, end_time
),
new_participants AS (
  INSERT INTO EventParticipants (event_id, user_id)
  SELECT ne.event_id, u.user_id
  FROM new_event ne
  JOIN Users u ON u.user_id = ANY($6::int[])
  WHERE u.user_id <> $1
  ON CONFLICT (event_id, user_id) DO NOTHING
  RETURNING user_id
)
SELECT ne.event_id,
       ne.title,
       ne.description,
       ne.start_time,
       ne.end_time,
       (SELECT count(*) FROM new_participants) AS participants_added
FROM new_event ne;
