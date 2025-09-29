-- Master Import Script for Kayaalife Database
-- Execute this file to import all data into MySQL

-- Use the kayaalife database
USE kayaalife;

-- Set foreign key checks off temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Import users
SOURCE 01-users.sql;

-- Import categories  
SOURCE 02-categories.sql;

-- Import customers
SOURCE 03-customers.sql;

-- Import products and images
SOURCE 04-products.sql;

-- Import orders and order items
SOURCE 05-orders.sql;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Show import summary
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM categories) as total_categories,
  (SELECT COUNT(*) FROM customers) as total_customers,
  (SELECT COUNT(*) FROM products) as total_products,
  (SELECT COUNT(*) FROM product_images) as total_product_images,
  (SELECT COUNT(*) FROM orders) as total_orders,
  (SELECT COUNT(*) FROM order_items) as total_order_items;

SELECT "✓ Data import completed successfully!" as status;
