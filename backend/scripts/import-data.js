const { query, transaction } = require('../config/mysql-database');
const fs = require('fs');
const path = require('path');

// Helper function to convert undefined to null
function safeValue(value) {
  return value === undefined ? null : value;
}

// Helper function to generate a default hashed password
function getDefaultPassword() {
  // Using a simple default password hash for 'password123'
  // In production, you should use proper bcrypt
  return '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPWJGxsxm3PVK'; // password123
}

async function importData() {
  try {
    console.log('🚀 Starting data import to kayaalife database...\n');

    // Read all JSON files
    const exportDir = path.join(__dirname, '../exports');
    
    console.log('📂 Reading export files...');
    const users = JSON.parse(fs.readFileSync(path.join(exportDir, 'users.json'), 'utf8'));
    const categories = JSON.parse(fs.readFileSync(path.join(exportDir, 'categories.json'), 'utf8'));
    const customers = JSON.parse(fs.readFileSync(path.join(exportDir, 'customers.json'), 'utf8'));
    const products = JSON.parse(fs.readFileSync(path.join(exportDir, 'products.json'), 'utf8'));
    const orders = JSON.parse(fs.readFileSync(path.join(exportDir, 'orders.json'), 'utf8'));

    console.log(`✓ Loaded ${users.length} users`);
    console.log(`✓ Loaded ${categories.length} categories`);
    console.log(`✓ Loaded ${customers.length} customers`);
    console.log(`✓ Loaded ${products.length} products`);
    console.log(`✓ Loaded ${orders.length} orders\n`);

    // Import data using transaction
    await transaction(async (connection) => {
      // Clear existing data
      console.log('🗑️  Clearing existing data...');
      await connection.execute('DELETE FROM order_items');
      await connection.execute('DELETE FROM product_images');
      await connection.execute('DELETE FROM orders');
      await connection.execute('DELETE FROM products');
      await connection.execute('DELETE FROM customers');
      await connection.execute('DELETE FROM categories');
      await connection.execute('DELETE FROM users');
      console.log('✓ Cleared existing data\n');

      // Import users
      console.log('👥 Importing users...');
      for (const user of users) {
        await connection.execute(
          `INSERT INTO users (id, name, email, password, role, isActive, lastLogin, avatar, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            safeValue(user.id),
            safeValue(user.name),
            safeValue(user.email),
            safeValue(user.password) || getDefaultPassword(),
            safeValue(user.role) || 'staff',
            user.isActive !== false,
            safeValue(user.lastLogin),
            safeValue(user.avatar),
            new Date(user.createdAt || Date.now()),
            new Date(user.updatedAt || Date.now())
          ]
        );
      }
      console.log(`✓ Imported ${users.length} users\n`);

      // Import categories
      console.log('📂 Importing categories...');
      for (const category of categories) {
        await connection.execute(
          `INSERT INTO categories (id, name, slug, description, image, isActive, sortOrder, menuOrder, showInMenu, menuLevel, parentId, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            safeValue(category.id),
            safeValue(category.name),
            safeValue(category.slug),
            safeValue(category.description),
            safeValue(category.image),
            category.isActive !== false,
            category.sortOrder || 0,
            category.menuOrder || 0,
            category.showInMenu !== false,
            category.menuLevel || 0,
            safeValue(category.parentId),
            new Date(category.createdAt || Date.now()),
            new Date(category.updatedAt || Date.now())
          ]
        );
      }
      console.log(`✓ Imported ${categories.length} categories\n`);

      // Import customers
      console.log('👨‍👩‍👧‍👦 Importing customers...');
      for (const customer of customers) {
        await connection.execute(
          `INSERT INTO customers (id, name, email, phone, address, dateOfBirth, gender, isActive, totalOrders, totalSpent, averageOrderValue, lastOrderDate, customerSince, loyaltyPoints, preferredPaymentMethod, notes, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            safeValue(customer.id),
            safeValue(customer.name),
            safeValue(customer.email),
            safeValue(customer.phone),
            customer.address ? JSON.stringify(customer.address) : null,
            safeValue(customer.dateOfBirth),
            safeValue(customer.gender) || 'other',
            customer.isActive !== false,
            customer.totalOrders || 0,
            customer.totalSpent || 0,
            customer.averageOrderValue || 0,
            safeValue(customer.lastOrderDate),
            new Date(customer.customerSince || Date.now()),
            customer.loyaltyPoints || 0,
            safeValue(customer.preferredPaymentMethod) || 'card',
            safeValue(customer.notes),
            new Date(customer.createdAt || Date.now()),
            new Date(customer.updatedAt || Date.now())
          ]
        );
      }
      console.log(`✓ Imported ${customers.length} customers\n`);

      // Import products
      console.log('🛍️  Importing products...');
      let imageCount = 0;
      for (const product of products) {
        await connection.execute(
          `INSERT INTO products (id, name, description, category, price, costPrice, stock, sku, isActive, tags, weight, dimensions, totalSold, averageRating, reviewCount, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            safeValue(product.id),
            safeValue(product.name),
            safeValue(product.description),
            safeValue(product.category),
            product.price || 0,
            product.costPrice || 0,
            product.stock || 0,
            safeValue(product.sku),
            product.isActive !== false,
            product.tags ? JSON.stringify(product.tags) : null,
            product.weight || 0,
            product.dimensions ? JSON.stringify(product.dimensions) : null,
            product.totalSold || 0,
            product.averageRating || 0,
            product.reviewCount || 0,
            new Date(product.createdAt || Date.now()),
            new Date(product.updatedAt || Date.now())
          ]
        );

        // Import product images
        if (product.images && product.images.length > 0) {
          for (let i = 0; i < product.images.length; i++) {
            const image = product.images[i];
            await connection.execute(
              `INSERT INTO product_images (productId, url, alt, sortOrder) VALUES (?, ?, ?, ?)`,
              [safeValue(product.id), safeValue(image.url), safeValue(image.alt), i]
            );
            imageCount++;
          }
        }
      }
      console.log(`✓ Imported ${products.length} products`);
      console.log(`✓ Imported ${imageCount} product images\n`);

      // Import orders
      console.log('📦 Importing orders...');
      let orderItemCount = 0;
      for (const order of orders) {
        await connection.execute(
          `INSERT INTO orders (id, invoiceNumber, customerId, customerName, subtotal, tax, shipping, discount, total, paymentMethod, paymentStatus, status, shippingAddress, notes, orderDate, deliveryDate, trackingNumber, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            safeValue(order.id),
            safeValue(order.invoiceNumber),
            safeValue(order.customer || order.customerId),
            safeValue(order.customerName),
            order.subtotal || 0,
            order.tax || 0,
            order.shipping || 0,
            order.discount || 0,
            order.total || 0,
            safeValue(order.paymentMethod),
            safeValue(order.paymentStatus) || 'pending',
            safeValue(order.status) || 'pending',
            order.shippingAddress ? JSON.stringify(order.shippingAddress) : null,
            safeValue(order.notes),
            new Date(order.orderDate || Date.now()),
            safeValue(order.deliveryDate),
            safeValue(order.trackingNumber),
            new Date(order.createdAt || Date.now()),
            new Date(order.updatedAt || Date.now())
          ]
        );

        // Import order items
        if (order.items && order.items.length > 0) {
          for (const item of order.items) {
            await connection.execute(
              `INSERT INTO order_items (orderId, productId, productName, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?)`,
              [
                safeValue(order.id),
                safeValue(item.product || item.productId),
                safeValue(item.productName),
                item.quantity || 1,
                item.price || 0,
                item.total || 0
              ]
            );
            orderItemCount++;
          }
        }
      }
      console.log(`✓ Imported ${orders.length} orders`);
      console.log(`✓ Imported ${orderItemCount} order items\n`);
    });

    // Show summary
    console.log('📊 Import Summary:');
    const summary = await query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM categories) as total_categories,
        (SELECT COUNT(*) FROM customers) as total_customers,
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM product_images) as total_product_images,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COUNT(*) FROM order_items) as total_order_items
    `);

    const totals = summary[0];
    console.log(`   Users: ${totals.total_users}`);
    console.log(`   Categories: ${totals.total_categories}`);
    console.log(`   Customers: ${totals.total_customers}`);
    console.log(`   Products: ${totals.total_products}`);
    console.log(`   Product Images: ${totals.total_product_images}`);
    console.log(`   Orders: ${totals.total_orders}`);
    console.log(`   Order Items: ${totals.total_order_items}`);
    
    const totalRecords = Object.values(totals).reduce((sum, count) => sum + count, 0);
    console.log(`   TOTAL RECORDS: ${totalRecords}\n`);

    console.log('🎉 Data import completed successfully!');
    console.log('Your kayaalife database is now ready to use.\n');

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

importData().then(() => {
  console.log('✨ Import process finished. You can now test your application!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
