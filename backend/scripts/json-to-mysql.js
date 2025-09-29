const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Simple UUID v4 generator
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Read exported JSON files
const exportDir = path.join(__dirname, '../exports');
const sqlDir = path.join(__dirname, '../sql-exports');

// Create SQL exports directory
if (!fs.existsSync(sqlDir)) {
  fs.mkdirSync(sqlDir, { recursive: true });
}

// Helper function to escape SQL strings
function escapeSQLString(str) {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str === 'boolean') return str ? '1' : '0';
  if (typeof str === 'number') return str.toString();
  if (typeof str === 'object') return `'${JSON.stringify(str).replace(/'/g, "\\'")}'`;
  return `'${str.toString().replace(/'/g, "\\'")}'`;
}

// Helper function to format date for MySQL
function formatDate(dateStr) {
  if (!dateStr) return 'NULL';
  const date = new Date(dateStr);
  return `'${date.toISOString().slice(0, 19).replace('T', ' ')}'`;
}

// Generate UUID if ID is missing
function ensureId(item) {
  return item.id || uuidv4();
}

function convertUsers() {
  try {
    const users = JSON.parse(fs.readFileSync(path.join(exportDir, 'users.json'), 'utf8'));
    let sql = `-- Users Table Import\n`;
    sql += `DELETE FROM users;\n\n`;
    
    users.forEach(user => {
      const id = ensureId(user);
      const values = [
        escapeSQLString(id),
        escapeSQLString(user.name),
        escapeSQLString(user.email),
        escapeSQLString(user.password),
        escapeSQLString(user.role || 'staff'),
        user.isActive ? '1' : '0',
        formatDate(user.lastLogin),
        escapeSQLString(user.avatar),
        formatDate(user.createdAt || new Date().toISOString()),
        formatDate(user.updatedAt || new Date().toISOString())
      ].join(', ');
      
      sql += `INSERT INTO users (id, name, email, password, role, isActive, lastLogin, avatar, createdAt, updatedAt) VALUES (${values});\n`;
    });
    
    fs.writeFileSync(path.join(sqlDir, '01-users.sql'), sql);
    console.log(`✓ Generated SQL for ${users.length} users`);
  } catch (error) {
    console.error('Error converting users:', error.message);
  }
}

function convertCategories() {
  try {
    const categories = JSON.parse(fs.readFileSync(path.join(exportDir, 'categories.json'), 'utf8'));
    let sql = `-- Categories Table Import\n`;
    sql += `DELETE FROM categories;\n\n`;
    
    categories.forEach(category => {
      const id = ensureId(category);
      const values = [
        escapeSQLString(id),
        escapeSQLString(category.name),
        escapeSQLString(category.slug),
        escapeSQLString(category.description),
        escapeSQLString(category.image),
        category.isActive ? '1' : '0',
        category.sortOrder || 0,
        category.menuOrder || 0,
        category.showInMenu ? '1' : '0',
        category.menuLevel || 0,
        escapeSQLString(category.parentId),
        formatDate(category.createdAt || new Date().toISOString()),
        formatDate(category.updatedAt || new Date().toISOString())
      ].join(', ');
      
      sql += `INSERT INTO categories (id, name, slug, description, image, isActive, sortOrder, menuOrder, showInMenu, menuLevel, parentId, createdAt, updatedAt) VALUES (${values});\n`;
    });
    
    fs.writeFileSync(path.join(sqlDir, '02-categories.sql'), sql);
    console.log(`✓ Generated SQL for ${categories.length} categories`);
  } catch (error) {
    console.error('Error converting categories:', error.message);
  }
}

function convertCustomers() {
  try {
    const customers = JSON.parse(fs.readFileSync(path.join(exportDir, 'customers.json'), 'utf8'));
    let sql = `-- Customers Table Import\n`;
    sql += `DELETE FROM customers;\n\n`;
    
    customers.forEach(customer => {
      const id = ensureId(customer);
      const values = [
        escapeSQLString(id),
        escapeSQLString(customer.name),
        escapeSQLString(customer.email),
        escapeSQLString(customer.phone),
        escapeSQLString(customer.address),
        customer.dateOfBirth ? formatDate(customer.dateOfBirth).replace(/'/g, '') : 'NULL',
        escapeSQLString(customer.gender || 'other'),
        customer.isActive ? '1' : '0',
        customer.totalOrders || 0,
        customer.totalSpent || 0,
        customer.averageOrderValue || 0,
        formatDate(customer.lastOrderDate),
        formatDate(customer.customerSince || new Date().toISOString()),
        customer.loyaltyPoints || 0,
        escapeSQLString(customer.preferredPaymentMethod || 'card'),
        escapeSQLString(customer.notes),
        formatDate(customer.createdAt || new Date().toISOString()),
        formatDate(customer.updatedAt || new Date().toISOString())
      ].join(', ');
      
      sql += `INSERT INTO customers (id, name, email, phone, address, dateOfBirth, gender, isActive, totalOrders, totalSpent, averageOrderValue, lastOrderDate, customerSince, loyaltyPoints, preferredPaymentMethod, notes, createdAt, updatedAt) VALUES (${values});\n`;
    });
    
    fs.writeFileSync(path.join(sqlDir, '03-customers.sql'), sql);
    console.log(`✓ Generated SQL for ${customers.length} customers`);
  } catch (error) {
    console.error('Error converting customers:', error.message);
  }
}

function convertProducts() {
  try {
    const products = JSON.parse(fs.readFileSync(path.join(exportDir, 'products.json'), 'utf8'));
    let productsSql = `-- Products Table Import\n`;
    productsSql += `DELETE FROM product_images;\n`;
    productsSql += `DELETE FROM products;\n\n`;
    
    let imagesSql = `-- Product Images Table Import\n\n`;
    
    products.forEach(product => {
      const id = ensureId(product);
      const values = [
        escapeSQLString(id),
        escapeSQLString(product.name),
        escapeSQLString(product.description),
        escapeSQLString(product.category),
        product.price || 0,
        product.costPrice || 0,
        product.stock || 0,
        escapeSQLString(product.sku),
        product.isActive ? '1' : '0',
        escapeSQLString(product.tags),
        product.weight || 0,
        escapeSQLString(product.dimensions),
        product.totalSold || 0,
        product.averageRating || 0,
        product.reviewCount || 0,
        formatDate(product.createdAt || new Date().toISOString()),
        formatDate(product.updatedAt || new Date().toISOString())
      ].join(', ');
      
      productsSql += `INSERT INTO products (id, name, description, category, price, costPrice, stock, sku, isActive, tags, weight, dimensions, totalSold, averageRating, reviewCount, createdAt, updatedAt) VALUES (${values});\n`;
      
      // Handle product images
      if (product.images && product.images.length > 0) {
        product.images.forEach((image, index) => {
          const imageValues = [
            escapeSQLString(id),
            escapeSQLString(image.url),
            escapeSQLString(image.alt),
            index
          ].join(', ');
          
          imagesSql += `INSERT INTO product_images (productId, url, alt, sortOrder) VALUES (${imageValues});\n`;
        });
      }
    });
    
    fs.writeFileSync(path.join(sqlDir, '04-products.sql'), productsSql + '\n' + imagesSql);
    console.log(`✓ Generated SQL for ${products.length} products`);
  } catch (error) {
    console.error('Error converting products:', error.message);
  }
}

function convertOrders() {
  try {
    const orders = JSON.parse(fs.readFileSync(path.join(exportDir, 'orders.json'), 'utf8'));
    let ordersSql = `-- Orders Table Import\n`;
    ordersSql += `DELETE FROM order_items;\n`;
    ordersSql += `DELETE FROM orders;\n\n`;
    
    let itemsSql = `-- Order Items Table Import\n\n`;
    
    orders.forEach(order => {
      const id = ensureId(order);
      const values = [
        escapeSQLString(id),
        escapeSQLString(order.invoiceNumber),
        escapeSQLString(order.customer || order.customerId),
        escapeSQLString(order.customerName),
        order.subtotal || 0,
        order.tax || 0,
        order.shipping || 0,
        order.discount || 0,
        order.total || 0,
        escapeSQLString(order.paymentMethod),
        escapeSQLString(order.paymentStatus || 'pending'),
        escapeSQLString(order.status || 'pending'),
        escapeSQLString(order.shippingAddress),
        escapeSQLString(order.notes),
        formatDate(order.orderDate || new Date().toISOString()),
        formatDate(order.deliveryDate),
        escapeSQLString(order.trackingNumber),
        formatDate(order.createdAt || new Date().toISOString()),
        formatDate(order.updatedAt || new Date().toISOString())
      ].join(', ');
      
      ordersSql += `INSERT INTO orders (id, invoiceNumber, customerId, customerName, subtotal, tax, shipping, discount, total, paymentMethod, paymentStatus, status, shippingAddress, notes, orderDate, deliveryDate, trackingNumber, createdAt, updatedAt) VALUES (${values});\n`;
      
      // Handle order items
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          const itemValues = [
            escapeSQLString(id),
            escapeSQLString(item.product || item.productId),
            escapeSQLString(item.productName),
            item.quantity || 1,
            item.price || 0,
            item.total || 0
          ].join(', ');
          
          itemsSql += `INSERT INTO order_items (orderId, productId, productName, quantity, price, total) VALUES (${itemValues});\n`;
        });
      }
    });
    
    fs.writeFileSync(path.join(sqlDir, '05-orders.sql'), ordersSql + '\n' + itemsSql);
    console.log(`✓ Generated SQL for ${orders.length} orders`);
  } catch (error) {
    console.error('Error converting orders:', error.message);
  }
}

function generateMasterImportFile() {
  const masterSql = `-- Master Import Script for Nykaa Clone Database
-- Execute this file to import all data into MySQL

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
`;

  fs.writeFileSync(path.join(sqlDir, '00-master-import.sql'), masterSql);
  console.log('✓ Generated master import script');
}

// Main conversion function
async function convertAllData() {
  try {
    console.log('Converting exported JSON data to MySQL SQL files...\n');
    
    convertUsers();
    convertCategories();
    convertCustomers();
    convertProducts();
    convertOrders();
    generateMasterImportFile();
    
    console.log(`\n✓ Conversion completed successfully!`);
    console.log(`SQL files location: ${sqlDir}`);
    console.log('\nTo import into MySQL:');
    console.log('1. Create database: CREATE DATABASE nykaa_clone;');
    console.log('2. Use database: USE nykaa_clone;');
    console.log('3. Run: SOURCE /path/to/sql-exports/00-master-import.sql;');
    
  } catch (error) {
    console.error('Conversion failed:', error.message);
    process.exit(1);
  }
}

convertAllData();
