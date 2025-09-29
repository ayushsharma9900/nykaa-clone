-- Database Setup Script for Kayaalife Database
-- Creates all required tables

USE kayaalife;

-- Set foreign key checks off temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff', 'manager') DEFAULT 'staff',
  isActive BOOLEAN DEFAULT TRUE,
  lastLogin DATETIME NULL,
  avatar VARCHAR(500) NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR(500) NULL,
  isActive BOOLEAN DEFAULT TRUE,
  sortOrder INT DEFAULT 0,
  menuOrder INT DEFAULT 0,
  showInMenu BOOLEAN DEFAULT TRUE,
  menuLevel INT DEFAULT 0,
  parentId VARCHAR(36) NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_slug (slug),
  INDEX idx_isActive (isActive),
  FOREIGN KEY (parentId) REFERENCES categories(id) ON DELETE SET NULL
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  costPrice DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  sku VARCHAR(100) UNIQUE NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  tags JSON NULL,
  weight DECIMAL(8,2) DEFAULT 0,
  dimensions JSON NULL,
  totalSold INT DEFAULT 0,
  averageRating DECIMAL(3,2) DEFAULT 0,
  reviewCount INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_category (category),
  INDEX idx_price (price),
  INDEX idx_sku (sku),
  INDEX idx_totalSold (totalSold),
  FULLTEXT idx_search (name, description)
);

-- Product images table (separate table for multiple images)
CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productId VARCHAR(36) NOT NULL,
  url VARCHAR(500) NOT NULL,
  alt VARCHAR(255) NULL,
  sortOrder INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_productId (productId)
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NULL,
  address JSON NULL,
  dateOfBirth DATE NULL,
  gender ENUM('male', 'female', 'other') DEFAULT 'other',
  isActive BOOLEAN DEFAULT TRUE,
  totalOrders INT DEFAULT 0,
  totalSpent DECIMAL(10,2) DEFAULT 0,
  averageOrderValue DECIMAL(10,2) DEFAULT 0,
  lastOrderDate DATETIME NULL,
  customerSince DATETIME DEFAULT CURRENT_TIMESTAMP,
  loyaltyPoints INT DEFAULT 0,
  preferredPaymentMethod ENUM('cash', 'card', 'credit') DEFAULT 'card',
  notes TEXT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_totalSpent (totalSpent),
  INDEX idx_totalOrders (totalOrders),
  INDEX idx_lastOrderDate (lastOrderDate)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  invoiceNumber VARCHAR(50) UNIQUE NOT NULL,
  customerId VARCHAR(36) NOT NULL,
  customerName VARCHAR(255) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  shipping DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  paymentMethod ENUM('cash', 'card', 'credit') NOT NULL,
  paymentStatus ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  shippingAddress JSON NULL,
  notes TEXT NULL,
  orderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  deliveryDate DATETIME NULL,
  trackingNumber VARCHAR(100) NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_invoiceNumber (invoiceNumber),
  INDEX idx_customerId (customerId),
  INDEX idx_status (status),
  INDEX idx_paymentMethod (paymentMethod),
  INDEX idx_orderDate (orderDate),
  INDEX idx_total (total),
  FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId VARCHAR(36) NOT NULL,
  productId VARCHAR(36) NOT NULL,
  productName VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_orderId (orderId),
  INDEX idx_productId (productId)
);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

SELECT "✓ Database tables created successfully!" as status;
