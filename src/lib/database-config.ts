import { sql } from '@vercel/postgres';
import sqlite3 from 'sqlite3';
import path from 'path';

// Determine database type based on environment
const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
const usePostgres = isVercel && process.env.POSTGRES_URL;
const isServerless = isVercel; // Track if we're in serverless environment

// SQLite setup for local development
const DB_PATH = path.join(process.cwd(), 'database', 'kayaalife.db');
let db: sqlite3.Database | null = null;
let isInitialized = false;

// Database connection factory
function getSQLiteDatabase(): sqlite3.Database {
  if (!db) {
    // Ensure database directory exists for local development
    const fs = require('fs');
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Error opening SQLite database:', err);
      } else {
        console.log('✅ SQLite database connected:', DB_PATH);
      }
    });
  }
  return db;
}

// Universal database interface
export const runQuery = async (query: string, params: any[] = []): Promise<any> => {
  if (usePostgres) {
    // Convert SQLite syntax to PostgreSQL
    const pgQuery = convertSQLiteToPostgres(query);
    const pgParams = params.map((param, index) => `$${index + 1}`);
    let finalQuery = pgQuery;
    
    // Replace ? placeholders with PostgreSQL $1, $2, etc.
    let paramIndex = 1;
    finalQuery = finalQuery.replace(/\?/g, () => `$${paramIndex++}`);
    
    const result = await sql.query(finalQuery, params);
    return result;
  } else if (isServerless) {
    // In serverless environment without PostgreSQL - throw error to trigger fallback
    console.warn('⚠️ Database not available in serverless environment without POSTGRES_URL');
    throw new Error('Database not configured for serverless environment');
  } else {
    // SQLite for local development
    return new Promise((resolve, reject) => {
      const database = getSQLiteDatabase();
      database.run(query, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }
};

export const getAllQuery = async (query: string, params: any[] = []): Promise<any[]> => {
  if (usePostgres) {
    const pgQuery = convertSQLiteToPostgres(query);
    let paramIndex = 1;
    const finalQuery = pgQuery.replace(/\?/g, () => `$${paramIndex++}`);
    
    const result = await sql.query(finalQuery, params);
    return result.rows;
  } else if (isServerless) {
    // In serverless environment without PostgreSQL - throw error to trigger fallback
    console.warn('⚠️ Database not available in serverless environment without POSTGRES_URL');
    throw new Error('Database not configured for serverless environment');
  } else {
    // SQLite for local development
    return new Promise((resolve, reject) => {
      const database = getSQLiteDatabase();
      database.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
};

export const getQuery = async (query: string, params: any[] = []): Promise<any> => {
  if (usePostgres) {
    const pgQuery = convertSQLiteToPostgres(query);
    let paramIndex = 1;
    const finalQuery = pgQuery.replace(/\?/g, () => `$${paramIndex++}`);
    
    const result = await sql.query(finalQuery, params);
    return result.rows[0] || null;
  } else if (isServerless) {
    // In serverless environment without PostgreSQL - throw error to trigger fallback
    console.warn('⚠️ Database not available in serverless environment without POSTGRES_URL');
    throw new Error('Database not configured for serverless environment');
  } else {
    // SQLite for local development
    return new Promise((resolve, reject) => {
      const database = getSQLiteDatabase();
      database.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
};

// Convert SQLite syntax to PostgreSQL
function convertSQLiteToPostgres(query: string): string {
  let pgQuery = query;
  
  // Replace AUTOINCREMENT with SERIAL
  pgQuery = pgQuery.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY');
  
  // Replace TEXT with VARCHAR for better PostgreSQL compatibility
  pgQuery = pgQuery.replace(/TEXT/gi, 'TEXT');
  
  // Replace BOOLEAN DEFAULT 1/0 with BOOLEAN DEFAULT true/false
  pgQuery = pgQuery.replace(/BOOLEAN DEFAULT 1/gi, 'BOOLEAN DEFAULT true');
  pgQuery = pgQuery.replace(/BOOLEAN DEFAULT 0/gi, 'BOOLEAN DEFAULT false');
  
  // Replace DATETIME with TIMESTAMP
  pgQuery = pgQuery.replace(/DATETIME/gi, 'TIMESTAMP');
  
  // Replace CURRENT_TIMESTAMP with NOW()
  pgQuery = pgQuery.replace(/DEFAULT CURRENT_TIMESTAMP/gi, 'DEFAULT NOW()');
  
  // Handle IF NOT EXISTS for CREATE TABLE
  if (pgQuery.includes('CREATE TABLE IF NOT EXISTS')) {
    pgQuery = pgQuery.replace(/CREATE TABLE IF NOT EXISTS/gi, 'CREATE TABLE IF NOT EXISTS');
  }
  
  return pgQuery;
}

// Initialize database tables
export const ensureDatabaseInitialized = async () => {
  if (isInitialized) {
    return;
  }

  try {
    console.log(`🔧 Initializing database (Postgres: ${usePostgres})`);
    await createTables();
    await seedBasicData();
    isInitialized = true;
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
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
        image TEXT,
        isActive BOOLEAN DEFAULT ${usePostgres ? 'true' : '1'},
        sortOrder INTEGER DEFAULT 0,
        menuOrder INTEGER DEFAULT 0,
        showInMenu BOOLEAN DEFAULT ${usePostgres ? 'true' : '1'},
        menuLevel INTEGER DEFAULT 0,
        parentId TEXT,
        createdAt TIMESTAMP DEFAULT ${usePostgres ? 'NOW()' : 'CURRENT_TIMESTAMP'},
        updatedAt TIMESTAMP DEFAULT ${usePostgres ? 'NOW()' : 'CURRENT_TIMESTAMP'}
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
        isActive BOOLEAN DEFAULT ${usePostgres ? 'true' : '1'},
        tags TEXT,
        weight DECIMAL(8,2) DEFAULT 0,
        dimensions TEXT,
        totalSold INTEGER DEFAULT 0,
        averageRating DECIMAL(3,2) DEFAULT 0,
        reviewCount INTEGER DEFAULT 0,
        brand TEXT,
        rating DECIMAL(3,2) DEFAULT 0,
        sourceUrl TEXT,
        source TEXT,
        createdAt TIMESTAMP DEFAULT ${usePostgres ? 'NOW()' : 'CURRENT_TIMESTAMP'},
        updatedAt TIMESTAMP DEFAULT ${usePostgres ? 'NOW()' : 'CURRENT_TIMESTAMP'}
      )
    `);
    
    // Product images table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS product_images (
        id ${usePostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${usePostgres ? '' : 'AUTOINCREMENT'},
        productId TEXT NOT NULL,
        url TEXT NOT NULL,
        alt TEXT,
        sortOrder INTEGER DEFAULT 0,
        createdAt TIMESTAMP DEFAULT ${usePostgres ? 'NOW()' : 'CURRENT_TIMESTAMP'}
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
        customerPhone TEXT,
        subtotal DECIMAL(10,2) NOT NULL,
        tax DECIMAL(10,2) DEFAULT 0,
        shipping DECIMAL(10,2) DEFAULT 0,
        discount DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'pending',
        paymentStatus TEXT DEFAULT 'pending',
        paymentMethod TEXT DEFAULT 'cash',
        shippingAddress TEXT NOT NULL,
        notes TEXT,
        orderDate TIMESTAMP DEFAULT ${usePostgres ? 'NOW()' : 'CURRENT_TIMESTAMP'},
        createdAt TIMESTAMP DEFAULT ${usePostgres ? 'NOW()' : 'CURRENT_TIMESTAMP'},
        updatedAt TIMESTAMP DEFAULT ${usePostgres ? 'NOW()' : 'CURRENT_TIMESTAMP'}
      )
    `);
    
    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

// Seed basic data
const seedBasicData = async () => {
  try {
    // Check if we already have data
    const existingProducts = await getAllQuery('SELECT COUNT(*) as count FROM products');
    const productCount = usePostgres ? existingProducts[0].count : existingProducts[0]['COUNT(*)'];
    
    if (productCount > 0) {
      console.log('✅ Database already has data, skipping seed');
      return;
    }

    console.log('🌱 Seeding basic data...');

    // Seed categories
    const categories = [
      { id: 'cat-skincare', name: 'Skincare', slug: 'skincare', description: 'Premium skincare products for all skin types' },
      { id: 'cat-makeup', name: 'Makeup', slug: 'makeup', description: 'High-quality makeup and cosmetics' },
      { id: 'cat-haircare', name: 'Hair Care', slug: 'haircare', description: 'Professional hair care products' },
      { id: 'cat-fragrance', name: 'Fragrance', slug: 'fragrance', description: 'Luxurious perfumes and fragrances' },
    ];

    for (const category of categories) {
      const insertQuery = usePostgres 
        ? `INSERT INTO categories (id, name, slug, description, isActive, sortOrder, showInMenu)
           VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING`
        : `INSERT OR IGNORE INTO categories (id, name, slug, description, isActive, sortOrder, showInMenu)
           VALUES (?, ?, ?, ?, ?, ?, ?)`;
      
      const booleanValue = usePostgres ? true : 1;
      await runQuery(insertQuery, [category.id, category.name, category.slug, category.description, booleanValue, 0, booleanValue]);
    }

    // Seed sample products
    const products = [
      {
        id: generateId('prod'),
        name: 'Hydrating Face Serum',
        description: 'Advanced hydrating serum with hyaluronic acid for all skin types.',
        category: 'Skincare',
        price: 599.00,
        costPrice: 399.00,
        stock: 50,
        sku: generateSKU('Hydrating Face Serum', 'Skincare'),
        brand: 'KaayaLife',
        averageRating: 4.5,
        reviewCount: 123
      },
      {
        id: generateId('prod'),
        name: 'Vitamin C Brightening Cream',
        description: 'Brightening cream with vitamin C and natural extracts for radiant skin.',
        category: 'Skincare',
        price: 799.00,
        costPrice: 599.00,
        stock: 30,
        sku: generateSKU('Vitamin C Brightening Cream', 'Skincare'),
        brand: 'KaayaLife',
        averageRating: 4.7,
        reviewCount: 89
      },
      {
        id: generateId('prod'),
        name: 'Long-lasting Matte Lipstick',
        description: 'Ultra-long-lasting matte lipstick in vibrant shades.',
        category: 'Makeup',
        price: 299.00,
        costPrice: 199.00,
        stock: 75,
        sku: generateSKU('Long-lasting Matte Lipstick', 'Makeup'),
        brand: 'KaayaLife',
        averageRating: 4.3,
        reviewCount: 156
      },
      {
        id: generateId('prod'),
        name: 'Nourishing Hair Oil',
        description: 'Natural hair oil blend for deep nourishment and shine.',
        category: 'Hair Care',
        price: 499.00,
        costPrice: 349.00,
        stock: 40,
        sku: generateSKU('Nourishing Hair Oil', 'Hair Care'),
        brand: 'KaayaLife',
        averageRating: 4.6,
        reviewCount: 78
      },
      {
        id: generateId('prod'),
        name: 'Elegant Evening Perfume',
        description: 'Sophisticated evening fragrance with floral and woody notes.',
        category: 'Fragrance',
        price: 1299.00,
        costPrice: 999.00,
        stock: 25,
        sku: generateSKU('Elegant Evening Perfume', 'Fragrance'),
        brand: 'KaayaLife',
        averageRating: 4.8,
        reviewCount: 45
      }
    ];

    for (const product of products) {
      const insertQuery = usePostgres 
        ? `INSERT INTO products (
             id, name, description, category, price, costPrice, stock, sku,
             isActive, brand, averageRating, reviewCount, createdAt, updatedAt
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING`
        : `INSERT OR IGNORE INTO products (
             id, name, description, category, price, costPrice, stock, sku,
             isActive, brand, averageRating, reviewCount, createdAt, updatedAt
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const booleanValue = usePostgres ? true : 1;
      await runQuery(insertQuery, [
        product.id, product.name, product.description, product.category,
        product.price, product.costPrice, product.stock, product.sku,
        booleanValue, product.brand, product.averageRating, product.reviewCount,
        new Date().toISOString(), new Date().toISOString()
      ]);
    }

    console.log('✅ Basic data seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
};

// Utility functions
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const generateSKU = (productName: string, category: string): string => {
  const categoryPrefix = category.substring(0, 3).toUpperCase();
  const namePrefix = productName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
  const timestamp = Date.now().toString().slice(-6);
  return `${categoryPrefix}-${namePrefix}-${timestamp}`;
};

// Backward compatibility with existing code
export { runQuery as default };
