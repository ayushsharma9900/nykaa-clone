const { query } = require('../config/mysql-database');

// Image mapping by category and product type - Updated with working URLs
const imageMap = {
  'Makeup': {
    'lipstick': [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop&auto=format'
    ],
    'eyeshadow': [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=500&fit=crop&auto=format'
    ],
    'mascara': [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=500&fit=crop&auto=format'
    ],
    'foundation': [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=500&fit=crop&auto=format'
    ],
    'blush': [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=500&fit=crop&auto=format'
    ],
    'default': [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=500&fit=crop&auto=format'
    ]
  },
  'Skincare': {
    'serum': [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format'
    ],
    'cream': [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format'
    ],
    'cleanser': [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format'
    ],
    'sunscreen': [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format'
    ],
    'toner': [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format'
    ],
    'default': [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format'
    ]
  },
  'Hair Care': {
    'shampoo': [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format'
    ],
    'conditioner': [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format'
    ],
    'oil': [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format'
    ],
    'default': [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format'
    ]
  },
  'Fragrance': {
    'perfume': [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59d32?w=500&h=500&fit=crop&auto=format'
    ],
    'default': [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59d32?w=500&h=500&fit=crop&auto=format'
    ]
  },
  'Personal Care': {
    'deodorant': [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format'
    ],
    'body wash': [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format'
    ],
    'toothpaste': [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format'
    ],
    'default': [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format'
    ]
  },
  "Men's Grooming": {
    'default': [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format'
    ]
  },
  'Wellness': {
    'default': [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format'
    ]
  }
};

// Keywords to match product types
const keywords = {
  'lipstick': ['lip', 'matte', 'gloss', 'lipstick'],
  'eyeshadow': ['eye', 'shadow', 'palette', 'eyeshadow'],
  'mascara': ['mascara', 'lash'],
  'foundation': ['foundation', 'base', 'cover'],
  'blush': ['blush', 'cheek'],
  'serum': ['serum', 'vitamin', 'acid', 'essence'],
  'cream': ['cream', 'lotion', 'moisturizer', 'retinol', 'night'],
  'cleanser': ['cleanser', 'wash', 'face wash', 'facial'],
  'sunscreen': ['sunscreen', 'spf', 'sun protection'],
  'toner': ['toner', 'astringent'],
  'shampoo': ['shampoo'],
  'conditioner': ['conditioner', 'hair mask'],
  'oil': ['oil', 'hair oil'],
  'perfume': ['perfume', 'parfum', 'eau de'],
  'deodorant': ['deodorant', 'anti-perspirant'],
  'body wash': ['body wash', 'shower gel'],
  'toothpaste': ['toothpaste', 'dental']
};

function getProductImages(product) {
  const category = product.category || 'Personal Care';
  const productName = (product.name || '').toLowerCase();
  const tags = product.tags ? (typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags) : [];
  
  // Check if category exists in imageMap
  if (!imageMap[category]) {
    return imageMap['Personal Care']['default'];
  }
  
  const categoryImages = imageMap[category];
  
  // Try to match by keywords
  for (const [type, keywordList] of Object.entries(keywords)) {
    if (keywordList.some(keyword => 
      productName.includes(keyword) || 
      tags.some(tag => tag.toLowerCase().includes(keyword))
    )) {
      if (categoryImages[type]) {
        return categoryImages[type];
      }
    }
  }
  
  // Return default for category
  return categoryImages['default'] || imageMap['Personal Care']['default'];
}

async function fixProductImages() {
  try {
    console.log('🚀 Starting product image fix...\n');

    // Get ALL products (whether they have images or not)
    const allProducts = await query(`
      SELECT p.id, p.name, p.category, p.tags 
      FROM products p
    `);

    console.log(`🔧 Found ${allProducts.length} products to update with new image URLs`);
    
    let fixedCount = 0;
    const batchSize = 10;

    // Process products in batches
    for (let i = 0; i < allProducts.length; i += batchSize) {
      const batch = allProducts.slice(i, i + batchSize);
      
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}...`);
      
      for (const product of batch) {
        try {
          // First, delete existing images for this product
          await query('DELETE FROM product_images WHERE productId = ?', [product.id]);
          
          // Get appropriate images for this product
          const imageUrls = getProductImages(product);
          
          // Insert new images for this product
          for (let index = 0; index < imageUrls.length; index++) {
            const url = imageUrls[index];
            await query(
              'INSERT INTO product_images (productId, url, alt, sortOrder) VALUES (?, ?, ?, ?)',
              [product.id, url, `${product.name} - Image ${index + 1}`, index + 1]
            );
          }
          
          fixedCount++;
          
          if (fixedCount % 10 === 0) {
            console.log(`✅ Fixed ${fixedCount} products...`);
          }
          
        } catch (error) {
          console.error(`❌ Error fixing images for product ${product.id}:`, error.message);
        }
      }
    }

    console.log(`\n🎉 Successfully updated images for ${fixedCount} products!`);
    
    // Verify the fix
    const updatedCount = await query(`
      SELECT COUNT(DISTINCT p.id) as count 
      FROM products p 
      INNER JOIN product_images pi ON p.id = pi.productId
    `);
    
    console.log(`📊 Total products with images now: ${updatedCount[0].count}`);

    // Show some sample updated URLs
    const sampleImages = await query(`
      SELECT p.name, p.category, pi.url 
      FROM products p 
      INNER JOIN product_images pi ON p.id = pi.productId 
      ORDER BY p.id LIMIT 5
    `);
    
    console.log('\n📸 Sample updated image URLs:');
    sampleImages.forEach(img => {
      console.log(`- ${img.name} (${img.category}): ${img.url}`);
    });

  } catch (error) {
    console.error('❌ Error fixing product images:', error);
  }
  
  process.exit(0);
}

if (require.main === module) {
  fixProductImages();
}

module.exports = { fixProductImages };
