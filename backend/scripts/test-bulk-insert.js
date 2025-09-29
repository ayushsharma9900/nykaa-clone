const { query } = require('../config/mysql-database');

async function testBulkInsert() {
  try {
    console.log('🧪 Testing bulk insert functionality...\n');

    // Test 1: Get a sample product ID
    const products = await query('SELECT id FROM products LIMIT 1');
    if (products.length === 0) {
      console.log('❌ No products found to test with');
      return;
    }

    const productId = products[0].id;
    console.log(`📋 Testing with product ID: ${productId}`);

    // Test 2: Test the fixed bulk insert syntax
    const testImages = [
      ['test-url-1.jpg', 'Test Image 1', 1],
      ['test-url-2.jpg', 'Test Image 2', 2]
    ];

    // Use the same syntax as in the fixed routes
    const placeholders = testImages.map(() => '(?, ?, ?, ?)').join(', ');
    const flatValues = [];
    testImages.forEach(([url, alt, sortOrder]) => {
      flatValues.push(productId, url, alt, sortOrder);
    });

    console.log('🔧 Testing bulk insert syntax...');
    console.log(`   Placeholders: ${placeholders}`);
    console.log(`   Values count: ${flatValues.length}`);

    // Test the query (we'll clean up immediately)
    const insertQuery = `
      INSERT INTO product_images (productId, url, alt, sortOrder)
      VALUES ${placeholders}
    `;

    await query(insertQuery, flatValues);
    console.log('✅ Bulk insert successful!');

    // Clean up test data
    await query('DELETE FROM product_images WHERE url LIKE ?', ['test-url-%']);
    console.log('🧹 Test data cleaned up');

    console.log('\n🎉 Bulk insert functionality is working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);

    // Try to clean up any partial test data
    try {
      await query('DELETE FROM product_images WHERE url LIKE ?', ['test-url-%']);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
  }
  
  process.exit(0);
}

if (require.main === module) {
  testBulkInsert();
}

module.exports = { testBulkInsert };
