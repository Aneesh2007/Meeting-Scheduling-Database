-- Canonical definition of "what is on user X's calendar".
-- Every read query filters this view with WHERE viewer_id = $1.
-- Declined invitations are excluded, so declined events never block time.
CREATE OR REPLACE VIEW UserEvents AS
SELECT e.event_id, e.user_id AS owner_id, e.user_id AS viewer_id,
       e.title, e.description, e.start_time, e.end_time,
       'OWNER'::text AS role, 'ACCEPTED'::text AS status
FROM Events e
UNION ALL
SELECT e.event_id, e.user_id, p.user_id,
       e.title, e.description, e.start_time, e.end_time,
       'PARTICIPANT'::text, p.status::text
FROM Events e
JOIN EventParticipants p ON p.event_id = e.event_id
WHERE p.status <> 'DECLINED';
