-- find_user
-- params: $1 query (name or email fragment), $2 limit
-- returns: candidates, exact matches first. If >1 row the LLM must ask the user which one. Consider restricting to the requester's org/contacts in multi-tenant setups
SELECT user_id, username, email
FROM Users
WHERE strpos(lower(username), lower($1)) > 0
   OR strpos(lower(email),    lower($1)) > 0
ORDER BY (lower(username) = lower($1) OR lower(email) = lower($1)) DESC, username
LIMIT $2;
