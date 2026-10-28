-- find_next_available_slot
-- params: $1 user_ids int[], $2 after, $3 search_horizon_end, $4 duration interval (> 0)
-- returns: 0..1 row: earliest common free window >= duration
WITH busy AS (
  SELECT GREATEST(start_time, $2) AS s, LEAST(end_time, $3) AS e
  FROM UserEvents
  WHERE viewer_id = ANY($1)
    AND start_time < $3
    AND end_time   > $2
),
flagged AS (
  SELECT s, e,
         max(e) OVER (ORDER BY s, e ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS prev_max_e
  FROM busy
),
grouped AS (
  SELECT s, e,
         count(*) FILTER (WHERE prev_max_e IS NULL OR s > prev_max_e)
           OVER (ORDER BY s, e ROWS UNBOUNDED PRECEDING) AS grp
  FROM flagged
),
merged AS (
  SELECT min(s) AS s, max(e) AS e FROM grouped GROUP BY grp
)
, edges AS (
  SELECT s, e FROM merged
  UNION ALL SELECT $2::timestamptz, $2::timestamptz
  UNION ALL SELECT $3::timestamptz, $3::timestamptz
),
gaps AS (
  SELECT e AS gap_start, LEAD(s) OVER (ORDER BY s, e) AS gap_end
  FROM edges
)
SELECT gap_start AS start_time, gap_end AS end_time
FROM gaps
WHERE gap_end IS NOT NULL
  AND gap_end - gap_start >= $4::interval
ORDER BY gap_start
LIMIT 1;
