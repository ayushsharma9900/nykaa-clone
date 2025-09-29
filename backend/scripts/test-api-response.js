const { query } = require('../config/mysql-database');

// Helper function to get product images (same as in products.js)
const getProductImages = async (productId) => {
  const images = await query(
    'SELECT url, alt, sortOrder FROM product_images WHERE productId = ? ORDER BY sortOrder ASC',
    [productId]
  );
  return images.map(img => img.url);
};

async function testApiResponse() {
  try {
    console.log('🧪 Testing API response format...\n');

    // Get a sample of products
    const products = await query(`
      SELECT 
        id,
        name,
        description,
        category,
        price,
        costPrice,
        stock,
        sku,
        isActive,
        tags,
        weight,
        dimensions,
        totalSold,
        averageRating,
        reviewCount,
        createdAt,
        updatedAt
      FROM products 
      WHERE isActive = 1
      ORDER BY createdAt DESC
      LIMIT 5
    `);

    console.log(`📋 Testing ${products.length} sample products:\n`);

    // Get images for each product and show the API response format
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const images = await getProductImages(product.id);
        return {
          ...product,
          images
        };
      })
    );

    // Display the results
    productsWithImages.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Price: ₹${product.price}`);
      console.log(`   Stock: ${product.stock}`);
      console.log(`   Images (${product.images.length}):`)
      product.images.forEach((url, imgIndex) => {
        console.log(`     ${imgIndex + 1}. ${url}`);
      });
      console.log(`   Primary Image: ${product.images[0] || 'NO IMAGE'}`);
      console.log('');
    });

    // Check if any products don't have images
    const productsWithoutImages = productsWithImages.filter(p => !p.images || p.images.length === 0);
    
    if (productsWithoutImages.length > 0) {
      console.log(`❌ Products without images found:`);
      productsWithoutImages.forEach(p => {
        console.log(`  - ${p.name} (ID: ${p.id})`);
      });
    } else {
      console.log(`✅ All tested products have images!`);
    }

    console.log(`\n📊 Summary:`);
    console.log(`  Total products tested: ${productsWithImages.length}`);
    console.log(`  Products with images: ${productsWithImages.filter(p => p.images && p.images.length > 0).length}`);
    console.log(`  Products without images: ${productsWithoutImages.length}`);
    console.log(`  Total image URLs: ${productsWithImages.reduce((sum, p) => sum + (p.images ? p.images.length : 0), 0)}`);

  } catch (error) {
    console.error('❌ Error testing API response:', error);
  }
  
  process.exit(0);
}

if (require.main === module) {
  testApiResponse();
}

module.exports = { testApiResponse };
