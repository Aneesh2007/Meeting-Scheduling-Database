-- is_free
-- params: $1 user_id (injected), $2 start, $3 end
-- returns: single row: is_free boolean
SELECT NOT EXISTS (
  SELECT 1
  FROM UserEvents
  WHERE viewer_id = $1
    AND start_time < $3
    AND end_time   > $2
) AS is_free;
