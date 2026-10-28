-- get_user_by_email
-- params: $1 email
-- returns: 0..1 row
SELECT user_id, username, email, timezone
FROM Users
WHERE lower(email) = lower($1);
