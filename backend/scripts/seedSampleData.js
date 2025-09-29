const { query: dbQuery } = require('../config/mysql-database');
const crypto = require('crypto');

// Use crypto.randomUUID instead of uuid package
const uuidv4 = () => crypto.randomUUID();

const sampleCategories = [
  {
    name: 'Makeup',
    slug: 'makeup',
    description: 'Complete range of makeup products for all your beauty needs',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&auto=format',
    isActive: true,
    sortOrder: 1,
    menuOrder: 1,
    showInMenu: true,
    menuLevel: 0
  },
  {
    name: 'Skincare',
    slug: 'skincare',
    description: 'Premium skincare products for healthy and glowing skin',
    image: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400&h=400&fit=crop&auto=format',
    isActive: true,
    sortOrder: 2,
    menuOrder: 2,
    showInMenu: true,
    menuLevel: 0
  },
  {
    name: 'Fragrance',
    slug: 'fragrance',
    description: 'Luxury fragrances and perfumes for every occasion',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop&auto=format',
    isActive: true,
    sortOrder: 3,
    menuOrder: 3,
    showInMenu: true,
    menuLevel: 0
  },
  {
    name: 'Hair Care',
    slug: 'hair-care',
    description: 'Professional hair care products for all hair types',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop&auto=format',
    isActive: true,
    sortOrder: 4,
    menuOrder: 4,
    showInMenu: true,
    menuLevel: 0
  }
];

const sampleProducts = [
  {
    name: 'Matte Liquid Lipstick - Ruby Red',
    description: 'Long-lasting matte liquid lipstick with intense color payoff. Perfect for all-day wear.',
    category: 'Makeup',
    price: 24.99,
    costPrice: 12.50,
    stock: 50,
    sku: 'MLL-RR-001',
    tags: ['lipstick', 'matte', 'red', 'long-lasting'],
    weight: 0.1,
    averageRating: 4.5,
    reviewCount: 127,
    totalSold: 89,
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop&auto=format'
    ]
  },
  {
    name: 'Vitamin C Serum',
    description: 'Powerful vitamin C serum that brightens skin and reduces dark spots. Suitable for all skin types.',
    category: 'Skincare',
    price: 39.99,
    costPrice: 20.00,
    stock: 75,
    sku: 'VCS-001',
    tags: ['serum', 'vitamin-c', 'brightening', 'anti-aging'],
    weight: 0.2,
    averageRating: 4.8,
    reviewCount: 243,
    totalSold: 156,
    images: [
      'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format'
    ]
  },
  {
    name: 'Rose Gold Eau de Parfum',
    description: 'Elegant floral fragrance with notes of rose, jasmine, and vanilla. Perfect for evening wear.',
    category: 'Fragrance',
    price: 89.99,
    costPrice: 45.00,
    stock: 25,
    sku: 'RG-EDP-001',
    tags: ['perfume', 'floral', 'rose', 'elegant'],
    weight: 0.3,
    averageRating: 4.6,
    reviewCount: 89,
    totalSold: 67,
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59d32?w=500&h=500&fit=crop&auto=format'
    ]
  },
  {
    name: 'Hydrating Shampoo',
    description: 'Moisturizing shampoo for dry and damaged hair. Enriched with argan oil and keratin.',
    category: 'Hair Care',
    price: 28.99,
    costPrice: 14.50,
    stock: 100,
    sku: 'HS-001',
    tags: ['shampoo', 'hydrating', 'argan-oil', 'damaged-hair'],
    weight: 0.4,
    averageRating: 4.3,
    reviewCount: 156,
    totalSold: 234,
    images: [
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop&auto=format'
    ]
  },
  {
    name: 'Eyeshadow Palette - Sunset',
    description: '12-color eyeshadow palette with warm sunset tones. Highly pigmented and blendable.',
    category: 'Makeup',
    price: 45.99,
    costPrice: 23.00,
    stock: 35,
    sku: 'ESP-SS-001',
    tags: ['eyeshadow', 'palette', 'warm-tones', 'pigmented'],
    weight: 0.25,
    averageRating: 4.7,
    reviewCount: 98,
    totalSold: 56,
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500&h=500&fit=crop&auto=format'
    ]
  },
  {
    name: 'Retinol Night Cream',
    description: 'Anti-aging night cream with retinol to reduce fine lines and improve skin texture.',
    category: 'Skincare',
    price: 54.99,
    costPrice: 27.50,
    stock: 40,
    sku: 'RNC-001',
    tags: ['retinol', 'anti-aging', 'night-cream', 'fine-lines'],
    weight: 0.15,
    averageRating: 4.4,
    reviewCount: 78,
    totalSold: 43,
    images: [
      'https://images.unsplash.com/photo-1556228578-dd6e4b1f4ed5?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1556228843-f6532330642f?w=500&h=500&fit=crop&auto=format'
    ]
  }
];

async function seedData() {
  try {
    console.log('🌱 Starting to seed sample data...');

    // Insert categories
    console.log('📂 Inserting categories...');
    for (const category of sampleCategories) {
      const categoryId = uuidv4();
      await dbQuery(`
        INSERT INTO categories (
          id, name, slug, description, image, isActive,
          sortOrder, menuOrder, showInMenu, menuLevel, parentId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        categoryId,
        category.name,
        category.slug,
        category.description,
        category.image,
        category.isActive,
        category.sortOrder,
        category.menuOrder,
        category.showInMenu,
        category.menuLevel,
        null
      ]);
      console.log(`✓ Added category: ${category.name}`);
    }

    // Insert products
    console.log('📦 Inserting products...');
    for (const product of sampleProducts) {
      const productId = uuidv4();
      
      // Insert product
      await dbQuery(`
        INSERT INTO products (
          id, name, description, category, price, costPrice, stock, sku,
          isActive, tags, weight, totalSold, averageRating, reviewCount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        productId,
        product.name,
        product.description,
        product.category,
        product.price,
        product.costPrice,
        product.stock,
        product.sku,
        true,
        JSON.stringify(product.tags),
        product.weight,
        product.totalSold,
        product.averageRating,
        product.reviewCount
      ]);

      // Insert product images
      for (let i = 0; i < product.images.length; i++) {
        await dbQuery(`
          INSERT INTO product_images (productId, url, alt, sortOrder)
          VALUES (?, ?, ?, ?)
        `, [
          productId,
          product.images[i],
          `${product.name} image ${i + 1}`,
          i
        ]);
      }

      console.log(`✓ Added product: ${product.name}`);
    }

    console.log('🎉 Sample data seeded successfully!');
    console.log(`📊 Added ${sampleCategories.length} categories and ${sampleProducts.length} products`);
    
    // Show summary
    const [categoryCount] = await dbQuery('SELECT COUNT(*) as count FROM categories');
    const [productCount] = await dbQuery('SELECT COUNT(*) as count FROM products');
    const [imageCount] = await dbQuery('SELECT COUNT(*) as count FROM product_images');
    
    console.log(`\n📈 Database Summary:`);
    console.log(`   Categories: ${categoryCount.count}`);
    console.log(`   Products: ${productCount.count}`);
    console.log(`   Product Images: ${imageCount.count}`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedData };
