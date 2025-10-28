-- Database Setup Script for Grocery Ordering System
-- Run this script to ensure proper database setup

-- Drop and recreate database to ensure clean state
DROP DATABASE IF EXISTS grocery_db;
CREATE DATABASE grocery_db;
USE grocery_db;

-- Users Table
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(15),
  role ENUM('CUSTOMER', 'ADMIN', 'STORE_MANAGER', 'DELIVERY_PERSON') NOT NULL,
  address TEXT,
  city VARCHAR(50),
  postal_code VARCHAR(10),
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6)
);

-- Products Table
CREATE TABLE products (
  product_id INT PRIMARY KEY AUTO_INCREMENT,
  product_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  description TEXT,
  image_url VARCHAR(255),
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6)
);

-- Orders Table
CREATE TABLE orders (
  order_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  order_date DATETIME(6) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
  delivery_address TEXT,
  delivery_date DATE,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Order Items Table
CREATE TABLE order_items (
  order_item_id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT
);

-- Promotions Table
CREATE TABLE promotions (
  promotion_id INT PRIMARY KEY AUTO_INCREMENT,
  promotion_name VARCHAR(100) NOT NULL,
  description TEXT,
  discount_percentage DECIMAL(5, 2),
  discount_amount DECIMAL(10, 2),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  applicable_products VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6)
);

-- Stock Management Table
CREATE TABLE stock_management (
  stock_id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  warehouse_location VARCHAR(100),
  quantity_available INT NOT NULL,
  reorder_level INT,
  last_restocked DATETIME(6),
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6),
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Maintenance Reports Table
CREATE TABLE maintenance_reports (
  report_id INT PRIMARY KEY AUTO_INCREMENT,
  reported_by INT,
  report_type VARCHAR(50),
  description TEXT,
  status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') DEFAULT 'OPEN',
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6),
  FOREIGN KEY (reported_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Delivery Time Slots Table
CREATE TABLE delivery_time_slots (
  slot_id INT PRIMARY KEY AUTO_INCREMENT,
  delivery_person_id INT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_orders INT NOT NULL DEFAULT 5,
  notes TEXT,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6),
  FOREIGN KEY (delivery_person_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Delivery Tracking Table
CREATE TABLE delivery_tracking (
  tracking_id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  delivery_person_id INT,
  time_slot_id INT,
  current_status ENUM('PENDING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED') DEFAULT 'PENDING',
  current_location VARCHAR(255),
  estimated_delivery_time DATETIME(6),
  actual_delivery_time DATETIME(6),
  time_slot VARCHAR(50),
  delivery_notes TEXT,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6),
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (delivery_person_id) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (time_slot_id) REFERENCES delivery_time_slots(slot_id) ON DELETE SET NULL
);

-- Create Indexes for Performance
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_username ON users(username);
CREATE INDEX idx_order_user ON orders(user_id);
CREATE INDEX idx_order_status ON orders(status);
CREATE INDEX idx_product_category ON products(category);
CREATE INDEX idx_stock_product ON stock_management(product_id);
CREATE INDEX idx_delivery_order ON delivery_tracking(order_id);
CREATE INDEX idx_delivery_person ON delivery_tracking(delivery_person_id);
CREATE INDEX idx_delivery_status ON delivery_tracking(current_status);
CREATE INDEX idx_time_slot_person ON delivery_time_slots(delivery_person_id);
CREATE INDEX idx_time_slot_date ON delivery_time_slots(date);

-- Insert sample admin user
INSERT INTO users (username, password, email, phone, role, address, city, postal_code, created_at, updated_at) 
VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'admin@groceryhub.com', '1234567890', 'ADMIN', 'Admin Address', 'Admin City', '00000', NOW(), NOW());

-- Insert sample products
INSERT INTO products (product_name, category, price, stock_quantity, description, image_url, created_at, updated_at) VALUES
('Fresh Apples', 'Fruits', 2.99, 100, 'Fresh red apples', '/images/apples.jpg', NOW(), NOW()),
('Organic Bananas', 'Fruits', 1.99, 150, 'Organic yellow bananas', '/images/bananas.jpg', NOW(), NOW()),
('Whole Milk', 'Dairy', 3.49, 50, 'Fresh whole milk', '/images/milk.jpg', NOW(), NOW()),
('Bread Loaf', 'Bakery', 2.49, 75, 'Fresh white bread', '/images/bread.jpg', NOW(), NOW()),
('Chicken Breast', 'Meat', 8.99, 30, 'Fresh chicken breast', '/images/chicken.jpg', NOW(), NOW());

-- Insert sample stock management
INSERT INTO stock_management (product_id, warehouse_location, quantity_available, reorder_level, last_restocked, created_at, updated_at) VALUES
(1, 'Warehouse A', 100, 20, NOW(), NOW(), NOW()),
(2, 'Warehouse A', 150, 30, NOW(), NOW(), NOW()),
(3, 'Warehouse B', 50, 10, NOW(), NOW(), NOW()),
(4, 'Warehouse B', 75, 15, NOW(), NOW(), NOW()),
(5, 'Warehouse C', 30, 5, NOW(), NOW(), NOW());

-- Insert sample promotions
INSERT INTO promotions (promotion_name, description, discount_percentage, start_date, end_date, applicable_products, is_active, created_at, updated_at) VALUES
('Summer Sale', '20% off all fruits', 20.00, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'Fruits', TRUE, NOW(), NOW()),
('Dairy Special', '15% off dairy products', 15.00, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'Dairy', TRUE, NOW(), NOW());

SELECT 'Database setup completed successfully!' as status;
