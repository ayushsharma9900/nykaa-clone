const fs = require('fs');
const path = require('path');

// Define image URLs by category and product types
const imageMap = {
  'Makeup': {
    'lipstick': [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop&auto=format'
    ],
    'eyeshadow': [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500&h=500&fit=crop&auto=format'
    ],
    'mascara': [
      'https://images.unsplash.com/photo-1631214540181-cdb35d4b3e5b?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=500&h=500&fit=crop&auto=format'
    ],
    'foundation': [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=500&fit=crop&auto=format'
    ],
    'blush': [
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&h=500&fit=crop&auto=format'
    ],
    'default': [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=500&fit=crop&auto=format'
    ]
  },
  'Skincare': {
    'serum': [
      'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format'
    ],
    'cream': [
      'https://images.unsplash.com/photo-1556228578-dd6e4b1f4ed5?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1556228843-f6532330642f?w=500&h=500&fit=crop&auto=format'
    ],
    'cleanser': [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1556909205-f2d9a4bf9df7?w=500&h=500&fit=crop&auto=format'
    ],
    'sunscreen': [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=500&h=500&fit=crop&auto=format'
    ],
    'toner': [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1556228578-dd6e4b1f4ed5?w=500&h=500&fit=crop&auto=format'
    ],
    'default': [
      'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format'
    ]
  },
  'Hair Care': {
    'shampoo': [
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop&auto=format'
    ],
    'conditioner': [
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&h=500&fit=crop&auto=format'
    ],
    'oil': [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1556228578-dd6e4b1f4ed5?w=500&h=500&fit=crop&auto=format'
    ],
    'default': [
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop&auto=format'
    ]
  },
  'Personal Care': {
    'perfume': [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59d32?w=500&h=500&fit=crop&auto=format'
    ],
    'fragrance': [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59d32?w=500&h=500&fit=crop&auto=format'
    ],
    'deodorant': [
      'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format'
    ],
    'body wash': [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1556228578-dd6e4b1f4ed5?w=500&h=500&fit=crop&auto=format'
    ],
    'toothpaste': [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500&h=500&fit=crop&auto=format'
    ],
    'mouthwash': [
      'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=500&fit=crop&auto=format'
    ],
    'default': [
      'https://images.unsplash.com/photo-1556228578-dd6e4b1f4ed5?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format'
    ]
  }
};

// Function to get appropriate images for a product
function getProductImages(product) {
  const category = product.category || 'Personal Care';
  const productName = (product.name || '').toLowerCase();
  const tags = product.tags || [];
  
  // Check if category exists in imageMap
  if (!imageMap[category]) {
    return imageMap['Personal Care']['default'];
  }
  
  const categoryImages = imageMap[category];
  
  // Try to match by product name keywords
  for (const [type, images] of Object.entries(categoryImages)) {
    if (type === 'default') continue;
    
    if (productName.includes(type) || tags.some(tag => tag.toLowerCase().includes(type))) {
      return images;
    }
  }
  
  // Try broader keyword matching
  const keywords = {
    'lipstick': ['lip', 'matte', 'gloss'],
    'eyeshadow': ['eye', 'shadow', 'palette'],
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
    'fragrance': ['fragrance', 'cologne'],
    'deodorant': ['deodorant', 'anti-perspirant'],
    'body wash': ['body wash', 'shower gel'],
    'toothpaste': ['toothpaste', 'dental'],
    'mouthwash': ['mouthwash', 'rinse']
  };
  
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

// Main function to fix product images
function fixProductImages() {
  const productsFile = path.join(__dirname, '..', 'backend', 'exports', 'products.json');
  
  if (!fs.existsSync(productsFile)) {
    console.error('Products file not found:', productsFile);
    return;
  }
  
  console.log('Reading products file...');
  const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
  
  let fixedCount = 0;
  let totalProducts = products.length;
  
  console.log(`Processing ${totalProducts} products...`);
  
  // Process each product
  products.forEach((product, index) => {
    // Skip if product already has images (non-empty array)
    if (product.images && product.images.length > 0) {
      // Check if it's just an empty array vs array with objects
      const hasValidImages = product.images.some(img => 
        (typeof img === 'string' && img.length > 0) || 
        (typeof img === 'object' && img.url && img.url.length > 0)
      );
      
      if (hasValidImages) {
        return; // Skip this product as it already has valid images
      }
    }
    
    // Get appropriate images for this product
    const newImages = getProductImages(product);
    
    // Update the product images
    product.images = newImages.map((url, idx) => ({
      url: url,
      alt: `${product.name} image ${idx + 1}`,
      _id: `img_${product.id || index}_${idx}`
    }));
    
    fixedCount++;
    
    if (fixedCount % 100 === 0) {
      console.log(`Fixed ${fixedCount} products...`);
    }
  });
  
  console.log(`Writing updated products file...`);
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
  
  console.log(`✅ Successfully fixed ${fixedCount} out of ${totalProducts} products`);
  console.log(`📊 Products with working image URLs: ${fixedCount}`);
  console.log(`📊 Products that already had images: ${totalProducts - fixedCount}`);
}

// Run the fix
if (require.main === module) {
  try {
    fixProductImages();
  } catch (error) {
    console.error('❌ Error fixing product images:', error);
    process.exit(1);
  }
}

module.exports = { fixProductImages };
