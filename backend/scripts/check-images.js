const { query } = require('../config/mysql-database');

async function checkImageStatus() {
  try {
    console.log('🔍 Checking product image status...\n');

    // Get total products
    const totalProducts = await query('SELECT COUNT(*) as count FROM products');
    console.log(`📊 Total products: ${totalProducts[0].count}`);

    // Get sample products
    const products = await query('SELECT id, name, category FROM products LIMIT 5');
    console.log('\n📋 Sample products:');
    products.forEach(p => {
      console.log(`- ${p.id}: ${p.name} (${p.category})`);
    });

    // Check product images table
    const imageCount = await query('SELECT COUNT(*) as count FROM product_images');
    console.log(`\n🖼️  Total product images: ${imageCount[0].count}`);

    // Products with images
    const productsWithImages = await query(`
      SELECT COUNT(DISTINCT p.id) as count 
      FROM products p 
      INNER JOIN product_images pi ON p.id = pi.productId
    `);
    console.log(`✅ Products with images: ${productsWithImages[0].count}`);

    // Products without images
    const productsWithoutImages = await query(`
      SELECT COUNT(*) as count 
      FROM products p 
      LEFT JOIN product_images pi ON p.id = pi.productId 
      WHERE pi.productId IS NULL
    `);
    console.log(`❌ Products without images: ${productsWithoutImages[0].count}`);

    // Show some products without images
    const productsNeedingImages = await query(`
      SELECT p.id, p.name, p.category 
      FROM products p 
      LEFT JOIN product_images pi ON p.id = pi.productId 
      WHERE pi.productId IS NULL 
      LIMIT 5
    `);
    
    if (productsNeedingImages.length > 0) {
      console.log('\n🔧 Sample products needing images:');
      productsNeedingImages.forEach(p => {
        console.log(`- ${p.id}: ${p.name} (${p.category})`);
      });
    }

    console.log('\n✅ Image status check complete!');

  } catch (error) {
    console.error('❌ Error checking image status:', error);
  }
  
  process.exit(0);
}

if (require.main === module) {
  checkImageStatus();
}

module.exports = { checkImageStatus };
