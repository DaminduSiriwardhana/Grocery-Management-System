-- Test database connection and basic operations
-- Run this to verify database is working

USE grocery_db;

-- Test 1: Check if tables exist
SHOW TABLES;

-- Test 2: Check users table structure
DESCRIBE users;

-- Test 3: Check if any users exist
SELECT COUNT(*) as user_count FROM users;

-- Test 4: Check if products exist
SELECT COUNT(*) as product_count FROM products;

-- Test 5: Try to insert a test user (will fail if email already exists)
INSERT INTO users (username, password, email, phone, role, address, city, postal_code, created_at, updated_at) 
VALUES ('testuser', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'test@example.com', '1234567890', 'CUSTOMER', 'Test Address', 'Test City', '12345', NOW(), NOW())
ON DUPLICATE KEY UPDATE username = username;

-- Test 6: Check the test user was inserted
SELECT user_id, username, email, role, created_at FROM users WHERE email = 'test@example.com';

-- Test 7: Clean up test user
DELETE FROM users WHERE email = 'test@example.com';

SELECT 'Database connection test completed successfully!' as status;
