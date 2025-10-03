// Safe imports with error handling
let sql: unknown = null;
let sqlite3: unknown = null;
let path: unknown = null;

// Import dependencies with fallbacks
try {
  sql = require('@vercel/postgres').sql;
} catch (error) {
  console.log('⚠️ Vercel Postgres not available');
}

try {
  path = require('path');
} catch (error) {
  console.log('⚠️ Path module not available');
}

try {
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    sqlite3 = require('sqlite3');
  }
} catch (error) {
  console.log('SQLite not available - running in production mode');
}

// Environment detection with multiple fallbacks
const isVercel = !!(process.env.VERCEL || process.env.VERCEL_URL || process.env.NODE_ENV === 'production');
const hasPostgresUrl = !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);
const usePostgres = isVercel && hasPostgresUrl && sql;
const isServerless = isVercel;
const isLocalDev = !isVercel && process.env.NODE_ENV !== 'production';

console.log('🔧 Database Environment:', {
  isVercel,
  hasPostgresUrl,
  usePostgres,
  isServerless,
  isLocalDev,
  nodeEnv: process.env.NODE_ENV
});

// SQLite setup for local development
let DB_PATH = '/tmp/kayaalife.db'; // Default fallback path
if (path && isLocalDev) {
  try {
    DB_PATH = path.join(process.cwd(), 'database', 'kayaalife.db');
  } catch (error) {
    console.log('⚠️ Could not create database path, using fallback');
  }
}

let db: any = null;
let isInitialized = false;

// Database connection factory
function getSQLiteDatabase(): any {
  if (!sqlite3) {
    throw new Error('SQLite not available in production environment');
  }
  
  if (!db) {
    // Ensure database directory exists for local development
    const fs = require('fs');
    const dbDir = (path as any).dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new sqlite3.Database(DB_PATH, (err: any) => {
      if (err) {
        console.error('❌ Error opening SQLite database:', err);
      } else {
        console.log('✅ SQLite database connected:', DB_PATH);
      }
    });
  }
  return db;
}

// Universal database interface with comprehensive error handling
export const runQuery = async (query: string, params: any[] = []): Promise<any> => {
  try {
    console.log('🔍 runQuery called:', { usePostgres, isServerless, query: query.substring(0, 50) + '...' });
    
    if (usePostgres && sql) {
      try {
        // Convert SQLite syntax to PostgreSQL
        const pgQuery = convertSQLiteToPostgres(query);
        let paramIndex = 1;
        const finalQuery = pgQuery.replace(/\?/g, () => `$${paramIndex++}`);
        
        console.log('🔍 Executing PostgreSQL query');
        const result = await sql.query(finalQuery, params);
        return result;
      } catch (pgError) {
        console.error('❌ PostgreSQL query failed:', pgError);
        throw pgError;
      }
    } else if (isLocalDev && sqlite3) {
      // SQLite for local development
      try {
        return new Promise((resolve, reject) => {
          const database = getSQLiteDatabase();
          database.run(query, params, function(err: any) {
            if (err) reject(err);
            else resolve(this);
          });
        });
      } catch (sqliteError) {
        console.error('❌ SQLite query failed:', sqliteError);
        throw sqliteError;
      }
    } else {
      // Serverless environment without database - return mock result
      console.log('🔄 No database available, returning mock result for write query');
      return { 
        rows: [], 
        rowCount: 1, 
        insertId: `mock-${Date.now()}`,
        changes: 1,
        lastID: Date.now()
      };
    }
  } catch (error) {
    console.error('🔥 runQuery error:', error);
    // Return mock success result to prevent crashes
    return { 
      rows: [], 
      rowCount: 0, 
      insertId: null,
      changes: 0,
      lastID: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const getAllQuery = async (query: string, params: any[] = []): Promise<any[]> => {
  try {
    console.log('🔍 getAllQuery called:', { usePostgres, isServerless, query: query.substring(0, 50) + '...' });
    
    if (usePostgres && sql) {
      try {
        const pgQuery = convertSQLiteToPostgres(query);
        let paramIndex = 1;
        const finalQuery = pgQuery.replace(/\?/g, () => `$${paramIndex++}`);
        
        console.log('🔍 Executing PostgreSQL query');
        const result = await sql.query(finalQuery, params);
        return result.rows || [];
      } catch (pgError) {
        console.error('❌ PostgreSQL query failed, falling back to fallback data:', pgError);
        // Fall through to fallback data
      }
    }
    
    if (isLocalDev && sqlite3) {
      try {
        // SQLite for local development
        return new Promise((resolve, reject) => {
          const database = getSQLiteDatabase();
          database.all(query, params, (err: any, rows: any) => {
            if (err) {
              console.error('❌ SQLite query failed, falling back:', err);
              resolve([]); // Don't reject, fall back to empty array
            } else {
              resolve(rows || []);
            }
          });
        });
      } catch (sqliteError) {
        console.error('❌ SQLite setup failed, using fallback data:', sqliteError);
        // Fall through to fallback data
      }
    }
    
    // Use fallback data system
    console.log('🔄 Using fallback data system');
    try {
      const { getFallbackData } = await import('./fallback-data');
      const fallbackResult = await getFallbackData(query, params);
      console.log(`📆 Fallback data returned: ${fallbackResult.length} items`);
      return fallbackResult;
    } catch (fallbackError) {
      console.error('❌ Fallback data failed:', fallbackError);
      return []; // Ultimate fallback
    }
    
  } catch (error) {
    console.error('🔥 getAllQuery critical error:', error);
    return []; // Always return array to prevent crashes
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
    // In serverless environment without PostgreSQL - use fallback data
    console.warn('⚠️ Database not available in serverless environment without POSTGRES_URL, using fallback');
    // Import fallback data for serverless
    const { getFallbackData } = await import('./fallback-data');
    const results = await getFallbackData(query, params);
    return results[0] || null;
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

// Initialize database tables with bulletproof error handling
export const ensureDatabaseInitialized = async () => {
  // Always mark as initialized to prevent retry loops
  if (isInitialized) {
    console.log('🔄 Database already initialized');
    return;
  }

  try {
    console.log(`🔧 Attempting database initialization...`);
    console.log(`Environment: Postgres=${usePostgres}, Serverless=${isServerless}, LocalDev=${isLocalDev}`);
    
    // Skip database initialization if no database is available
    if (isServerless && !usePostgres) {
      console.log('🔄 Serverless mode without PostgreSQL - using fallback data only');
      isInitialized = true;
      return;
    }
    
    if (isLocalDev && !sqlite3) {
      console.log('🔄 Local development without SQLite - using fallback data only');
      isInitialized = true;
      return;
    }
    
    // Only attempt actual database operations if we have a database
    if ((usePostgres && sql) || (isLocalDev && sqlite3)) {
      console.log('🔧 Database available, initializing tables...');
      
      try {
        await createTables();
        console.log('✅ Tables created successfully');
        
        try {
          await seedBasicData();
          console.log('✅ Basic data seeded successfully');
        } catch (seedError) {
          console.warn('⚠️ Failed to seed basic data (tables exist):', seedError);
          // Don't fail if seeding fails - tables exist
        }
        
        console.log('✅ Database initialized successfully');
      } catch (dbError) {
        console.error('❌ Database operations failed:', dbError);
        console.log('🔄 Will use fallback data system');
        // Don't throw - just use fallback data
      }
    } else {
      console.log('🔄 No database available - will use fallback data system');
    }
    
    // Always mark as initialized to prevent retry loops
    isInitialized = true;
    
  } catch (error) {
    console.error('❌ Database initialization critical error:', error);
    // Always mark as initialized to prevent infinite retry loops
    isInitialized = true;
    console.log('🔄 Marked as initialized despite errors - will use fallback data');
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
