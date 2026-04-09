INSERT INTO users (email, full_name, password_hash, role, city, latitude, longitude, created_at)
VALUES
('host1@example.com', 'Host One', '$2b$12$examplehashreplace', 'host', 'Bengaluru', 12.9716, 77.5946, NOW()),
('user1@example.com', 'User One', '$2b$12$examplehashreplace', 'user', 'Bengaluru', 12.9716, 77.5946, NOW());

INSERT INTO events (host_id, title, description, category, event_date, venue_name, latitude, longitude, price, capacity, tickets_available, image_url, views, created_at, is_active)
VALUES
(1, 'Sunset Jazz Night', 'Live jazz with local artists', 'Music', NOW() + INTERVAL '3 day', 'Indiranagar Arena', 12.9784, 77.6408, 599.00, 120, 120, NULL, 43, NOW(), true),
(1, 'Startup Founder Mixer', 'Network with founders and investors', 'Business', NOW() + INTERVAL '5 day', 'Koramangala Hub', 12.9352, 77.6245, 799.00, 80, 80, NULL, 31, NOW(), true),
(1, 'Weekend Standup Showcase', 'Top comedians performing live', 'Comedy', NOW() + INTERVAL '2 day', 'HSR Laugh Club', 12.9116, 77.6474, 499.00, 200, 200, NULL, 55, NOW(), true);
