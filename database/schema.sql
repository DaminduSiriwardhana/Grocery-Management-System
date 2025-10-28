-- Create Database
CREATE DATABASE IF NOT EXISTS grocery_db;
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
  order_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
  delivery_address TEXT,
  delivery_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Stock Management Table
CREATE TABLE stock_management (
  stock_id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  warehouse_location VARCHAR(100),
  quantity_available INT NOT NULL,
  reorder_level INT,
  last_restocked TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reported_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Delivery Time Slots Table (moved before delivery_tracking to fix forward reference)
CREATE TABLE delivery_time_slots (
  slot_id INT PRIMARY KEY AUTO_INCREMENT,
  delivery_person_id INT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_orders INT NOT NULL DEFAULT 5,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
  estimated_delivery_time DATETIME,
  actual_delivery_time DATETIME,
  time_slot VARCHAR(50),
  delivery_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (delivery_person_id) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (time_slot_id) REFERENCES delivery_time_slots(slot_id) ON DELETE SET NULL
);

-- Create Indexes for Performance
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_order_user ON orders(user_id);
CREATE INDEX idx_order_status ON orders(status);
CREATE INDEX idx_product_category ON products(category);
CREATE INDEX idx_stock_product ON stock_management(product_id);
CREATE INDEX idx_delivery_order ON delivery_tracking(order_id);
CREATE INDEX idx_delivery_person ON delivery_tracking(delivery_person_id);
CREATE INDEX idx_delivery_status ON delivery_tracking(current_status);
CREATE INDEX idx_time_slot_person ON delivery_time_slots(delivery_person_id);
CREATE INDEX idx_time_slot_date ON delivery_time_slots(date);
