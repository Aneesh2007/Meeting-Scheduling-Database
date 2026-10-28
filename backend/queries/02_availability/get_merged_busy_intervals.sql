-- get_merged_busy_intervals
-- params: $1 user_ids int[], $2 range_start, $3 range_end
-- returns: union of everyone's busy time, overlaps merged, clipped to range
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
SELECT s AS start_time, e AS end_time FROM merged ORDER BY s;
