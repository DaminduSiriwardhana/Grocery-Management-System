-- Drop and recreate the database to fix schema issues
DROP DATABASE IF EXISTS grocery_db;
CREATE DATABASE grocery_db;

-- Now run the application with spring.jpa.hibernate.ddl-auto=create
-- Hibernate will automatically create all tables with the correct schema

