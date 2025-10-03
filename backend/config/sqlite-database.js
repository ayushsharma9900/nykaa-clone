const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = path.join(__dirname, '..', 'kayaalife.db');
const db = new sqlite3.Database(dbPath);

// Create a promise wrapper for database operations
const runQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const getAllQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const getQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Create connection pool mockup for compatibility with MySQL code
const pool = {
  execute: async (query, params) => {
    if (query.toLowerCase().includes('select')) {
      const rows = await getAllQuery(query, params);
      return [rows];
    } else {
      const result = await runQuery(query, params);
      return [result];
    }
  },
  getConnection: async () => {
    return {
      execute: pool.execute,
      release: () => {},
      config: {
        host: 'sqlite',
        port: 'file',
        database: 'kayaalife.db'
      }
    };
  }
};

const connectDB = async () => {
  try {
    console.log('SQLite Connected: ' + dbPath);
    console.log('Database: kayaalife.db');
    
    // Create tables if they don't exist
    await createTables();
    
    // Seed some basic data
    await seedBasicData();
    
  } catch (error) {
    console.error('Database connection error:', error.message);
  }
};

const createTables = async () => {
  try {
    // Users table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        isActive BOOLEAN DEFAULT 1,
        avatar TEXT NULL,
        lastLogin DATETIME NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Categories table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        image TEXT NULL,
        isActive BOOLEAN DEFAULT 1,
        sortOrder INTEGER DEFAULT 0,
        menuOrder INTEGER DEFAULT 0,
        showInMenu BOOLEAN DEFAULT 1,
        menuLevel INTEGER DEFAULT 0,
        parentId TEXT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Products table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        costPrice DECIMAL(10,2) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        sku TEXT UNIQUE NOT NULL,
        isActive BOOLEAN DEFAULT 1,
        tags TEXT NULL,
        weight DECIMAL(8,2) DEFAULT 0,
        dimensions TEXT NULL,
        totalSold INTEGER DEFAULT 0,
        averageRating DECIMAL(3,2) DEFAULT 0,
        reviewCount INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Product images table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId TEXT NOT NULL,
        url TEXT NOT NULL,
        alt TEXT NULL,
        sortOrder INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ SQLite tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

const seedBasicData = async () => {
  try {
    // Check if we already have data
    const existingCategories = await getAllQuery('SELECT COUNT(*) as count FROM categories');
    if (existingCategories[0].count > 0) {
      console.log('✅ Database already has data, skipping seed');
      return;
    }

    // Import bcrypt for password hashing
    const bcrypt = require('bcryptjs');
    
    // Seed admin user
    const adminPassword = await bcrypt.hash('password123', 12);
    await runQuery(
      'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      ['admin-1', 'Admin User', 'admin@dashtar.com', adminPassword, 'admin']
    );

    // Seed categories
    const categories = [
      {
        id: 'cat-makeup',
        name: 'Makeup',
        slug: 'makeup',
        description: 'Complete makeup collection including foundations, lipsticks, and more'
      },
      {
        id: 'cat-skincare',
        name: 'Skincare',
        slug: 'skincare',
        description: 'Skincare products for all skin types'
      },
      {
        id: 'cat-fragrance',
        name: 'Fragrance',
        slug: 'fragrance',
        description: 'Premium fragrances and perfumes'
      },
      {
        id: 'cat-haircare',
        name: 'Hair Care',
        slug: 'haircare',
        description: 'Hair care products and treatments'
      }
    ];

    for (const category of categories) {
      await runQuery(
        'INSERT INTO categories (id, name, slug, description) VALUES (?, ?, ?, ?)',
        [category.id, category.name, category.slug, category.description]
      );
    }

    // Seed sample products
    const products = [
      {
        id: 'prod-1',
        name: 'Matte Foundation',
        description: 'Long-lasting matte foundation for all skin types',
        category: 'Makeup',
        price: 1299.00,
        costPrice: 800.00,
        stock: 50,
        sku: 'FOUND-MAT-001',
        averageRating: 4.5,
        reviewCount: 125
      },
      {
        id: 'prod-2',
        name: 'Hydrating Serum',
        description: 'Intensive hydrating serum with hyaluronic acid',
        category: 'Skincare',
        price: 2499.00,
        costPrice: 1500.00,
        stock: 30,
        sku: 'SER-HYD-002',
        averageRating: 4.7,
        reviewCount: 89
      },
      {
        id: 'prod-3',
        name: 'Rose Perfume',
        description: 'Elegant rose fragrance for special occasions',
        category: 'Fragrance',
        price: 3599.00,
        costPrice: 2200.00,
        stock: 25,
        sku: 'PERF-ROS-003',
        averageRating: 4.3,
        reviewCount: 67
      }
    ];

    for (const product of products) {
      await runQuery(`
        INSERT INTO products (id, name, description, category, price, costPrice, stock, sku, averageRating, reviewCount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        product.id, product.name, product.description, product.category,
        product.price, product.costPrice, product.stock, product.sku,
        product.averageRating, product.reviewCount
      ]);

      // Add sample images
      await runQuery(`
        INSERT INTO product_images (productId, url, alt, sortOrder)
        VALUES (?, ?, ?, ?)
      `, [
        product.id,
        `https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop`,
        product.name,
        0
      ]);
    }

    console.log('✅ Sample data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

const closePool = async () => {
  return new Promise((resolve) => {
    db.close((err) => {
      if (err) console.error('Error closing SQLite database:', err);
      else console.log('SQLite database closed');
      resolve();
    });
  });
};

module.exports = { pool, connectDB, closePool };
