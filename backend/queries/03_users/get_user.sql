-- get_user
-- params: $1 user_id
-- returns: 0..1 row
SELECT user_id, username, email, timezone
FROM Users
WHERE user_id = $1;
