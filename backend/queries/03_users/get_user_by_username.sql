-- get_user_by_username
-- params: $1 username
-- returns: 0..1 row
SELECT user_id, username, email, timezone
FROM Users
WHERE lower(username) = lower($1);
