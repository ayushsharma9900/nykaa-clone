const { query } = require('../config/mysql-database');
const https = require('https');

async function testImageUrl(url, timeout = 5000) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout }, (res) => {
      resolve({
        url,
        status: res.statusCode,
        success: res.statusCode >= 200 && res.statusCode < 400,
        contentType: res.headers['content-type']
      });
    });
    
    req.on('error', (err) => {
      resolve({
        url,
        status: 0,
        success: false,
        error: err.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        status: 0,
        success: false,
        error: 'Timeout'
      });
    });
  });
}

async function verifyImageUrls() {
  try {
    console.log('🔍 Verifying image URL accessibility...\n');

    // Get a sample of image URLs
    const images = await query(`
      SELECT p.name, p.category, pi.url 
      FROM products p 
      INNER JOIN product_images pi ON p.id = pi.productId 
      ORDER BY p.id 
      LIMIT 10
    `);

    console.log(`🧪 Testing ${images.length} sample image URLs:\n`);

    const results = await Promise.all(
      images.map(img => testImageUrl(img.url))
    );

    let successCount = 0;
    let failureCount = 0;

    results.forEach((result, index) => {
      const product = images[index];
      const status = result.success ? '✅' : '❌';
      
      console.log(`${status} ${product.name} (${product.category})`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Status: ${result.status} ${result.success ? 'OK' : 'FAILED'}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      console.log('');

      if (result.success) {
        successCount++;
      } else {
        failureCount++;
      }
    });

    console.log(`📊 Test Results:`);
    console.log(`  ✅ Successful: ${successCount}/${results.length}`);
    console.log(`  ❌ Failed: ${failureCount}/${results.length}`);

    if (successCount === results.length) {
      console.log(`\n🎉 All tested image URLs are accessible!`);
    } else if (successCount > 0) {
      console.log(`\n⚠️  Some images may have connectivity issues, but most are working.`);
    } else {
      console.log(`\n🚨 All images failed - there might be a network connectivity issue.`);
    }

    // Additional network test with a simple Unsplash image
    console.log(`\n🌐 Testing basic Unsplash connectivity...`);
    const testResult = await testImageUrl('https://images.unsplash.com/photo-1556228578-dd6e4b1f4ed5?w=100&h=100&fit=crop');
    console.log(`   Basic Unsplash test: ${testResult.success ? '✅ Connected' : '❌ Failed'}`);

  } catch (error) {
    console.error('❌ Error verifying image URLs:', error);
  }
  
  process.exit(0);
}

if (require.main === module) {
  verifyImageUrls();
}

module.exports = { verifyImageUrls };
