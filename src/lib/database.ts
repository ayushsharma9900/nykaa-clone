import sqlite3 from 'sqlite3';
import path from 'path';

// Use environment variable or fallback to local database
const DB_PATH = process.env.DATABASE_URL || path.join(process.cwd(), 'database', 'kayaalife.db');

let db: sqlite3.Database | null = null;

// Initialize database connection (singleton pattern for serverless)
function getDatabase(): sqlite3.Database {
  if (!db) {
    // Ensure database directory exists
    const fs = require('fs');
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening SQLite database:', err);
      } else {
        console.log('SQLite database connected:', DB_PATH);
      }
    });
  }
  return db;
}

// Promise wrapper for database operations
export const runQuery = (query: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

export const getAllQuery = (query: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

export const getQuery = (query: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Compatible pool interface for existing code
export const pool = {
  execute: async (query: string, params: any[] = []) => {
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

// Initialize database tables on first run
export const initializeDatabase = async () => {
  try {
    // Create tables if they don't exist
    await createTables();
    // Seed basic data
    await seedBasicData();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
};

const createTables = async () => {
  try {
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

    // Orders table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        invoiceNumber TEXT UNIQUE NOT NULL,
        customerId TEXT NOT NULL,
        customerName TEXT NOT NULL,
        customerEmail TEXT NOT NULL,
        customerPhone TEXT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        tax DECIMAL(10,2) DEFAULT 0,
        shipping DECIMAL(10,2) DEFAULT 0,
        discount DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'pending',
        paymentStatus TEXT DEFAULT 'pending',
        paymentMethod TEXT DEFAULT 'cash',
        shippingAddress TEXT NOT NULL,
        notes TEXT NULL,
        orderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Order items table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId TEXT NOT NULL,
        productId TEXT NOT NULL,
        productName TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES products(id)
      )
    `);

    console.log('✅ SQLite tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
};

const seedBasicData = async () => {
  try {
    // Check if we already have data
    const existingCategories = await getAllQuery('SELECT COUNT(*) as count FROM categories');
    if (existingCategories[0]?.count > 0) {
      console.log('✅ Database already has data, skipping seed');
      return;
    }

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
      },
      {
        id: 'prod-4',
        name: 'Nourishing Shampoo',
        description: 'Gentle nourishing shampoo for all hair types',
        category: 'Hair Care',
        price: 899.00,
        costPrice: 500.00,
        stock: 75,
        sku: 'SHAM-NOU-004',
        averageRating: 4.2,
        reviewCount: 156
      },
      {
        id: 'prod-5',
        name: 'Vitamin C Face Wash',
        description: 'Brightening face wash with vitamin C',
        category: 'Skincare',
        price: 799.00,
        costPrice: 450.00,
        stock: 40,
        sku: 'WASH-VIC-005',
        averageRating: 4.4,
        reviewCount: 98
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
    console.error('❌ Error seeding data:', error);
  }
};

// Helper functions
export const generateId = (prefix: string = 'id') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateSKU = (name: string, category: string) => {
  const nameCode = name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '');
  const catCode = category.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
  const timestamp = Date.now().toString().slice(-4);
  return `${nameCode}-${catCode}-${timestamp}`;
};

// Initialize database when module is imported
if (process.env.NODE_ENV !== 'test') {
  // Don't auto-initialize in test environment
  initializeDatabase().catch(console.error);
}
