-- Users Table Import
DELETE FROM users;

INSERT INTO users (id, name, email, password, role, isActive, lastLogin, avatar, createdAt, updatedAt) VALUES ('68d77b115da1b812da48b5a9', 'Manager User', 'manager@dashtar.com', NULL, 'manager', 1, NULL, NULL, '2025-09-27 05:50:09', '2025-09-27 05:50:09');
INSERT INTO users (id, name, email, password, role, isActive, lastLogin, avatar, createdAt, updatedAt) VALUES ('68d77b115da1b812da48b5aa', 'Staff User', 'staff@dashtar.com', NULL, 'staff', 1, NULL, NULL, '2025-09-27 05:50:09', '2025-09-27 05:50:09');
INSERT INTO users (id, name, email, password, role, isActive, lastLogin, avatar, createdAt, updatedAt) VALUES ('68d77b115da1b812da48b5a8', 'Admin User', 'admin@dashtar.com', NULL, 'admin', 1, NULL, NULL, '2025-09-27 05:50:09', '2025-09-27 05:50:09');
