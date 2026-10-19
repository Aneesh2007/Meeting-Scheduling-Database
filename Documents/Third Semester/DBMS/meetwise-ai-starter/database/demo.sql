INSERT INTO app_users (full_name, email) VALUES
('Aneesh Bansal', 'aneesh@example.com'),
('Rahul Sharma', 'rahul@example.com'),
('Priya Mehta', 'priya@example.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO rooms (room_name, capacity, location) VALUES
('Seminar Room A', 12, 'Academic Block'),
('Conference Room B', 8, 'Library Block')
ON CONFLICT (room_name) DO NOTHING;
