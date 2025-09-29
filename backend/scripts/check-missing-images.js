const { query } = require('../config/mysql-database');

async function checkMissingImages() {
  try {
    console.log('🔍 Checking for missing or invalid product images...\n');

    // Check for products without any images
    const productsWithoutImages = await query(`
      SELECT p.id, p.name, p.category 
      FROM products p 
      LEFT JOIN product_images pi ON p.id = pi.productId 
      WHERE pi.productId IS NULL
    `);
    
    console.log(`❌ Products without any images: ${productsWithoutImages.length}`);
    if (productsWithoutImages.length > 0) {
      console.log('Products missing images:');
      productsWithoutImages.forEach(p => {
        console.log(`  - ${p.id}: ${p.name} (${p.category})`);
      });
    }

    // Check for empty or invalid image URLs
    const emptyImages = await query(`
      SELECT p.id, p.name, pi.url 
      FROM products p 
      INNER JOIN product_images pi ON p.id = pi.productId 
      WHERE pi.url IS NULL OR pi.url = '' OR LENGTH(TRIM(pi.url)) = 0
    `);
    
    console.log(`\n🚫 Products with empty image URLs: ${emptyImages.length}`);
    if (emptyImages.length > 0) {
      console.log('Products with empty URLs:');
      emptyImages.forEach(p => {
        console.log(`  - ${p.id}: ${p.name} - URL: "${p.url}"`);
      });
    }

    // Check for non-Unsplash URLs (potentially broken local paths)
    const localImages = await query(`
      SELECT p.id, p.name, pi.url 
      FROM products p 
      INNER JOIN product_images pi ON p.id = pi.productId 
      WHERE pi.url NOT LIKE 'https://images.unsplash.com%'
    `);
    
    console.log(`\n⚠️  Products with non-Unsplash URLs: ${localImages.length}`);
    if (localImages.length > 0) {
      console.log('Products with potentially broken image URLs:');
      localImages.forEach(p => {
        console.log(`  - ${p.id}: ${p.name}`);
        console.log(`    URL: ${p.url}`);
      });
    }

    // Get some sample working images
    const workingImages = await query(`
      SELECT p.id, p.name, pi.url 
      FROM products p 
      INNER JOIN product_images pi ON p.id = pi.productId 
      WHERE pi.url LIKE 'https://images.unsplash.com%'
      LIMIT 5
    `);
    
    console.log(`\n✅ Sample working image URLs:`);
    workingImages.forEach(p => {
      console.log(`  - ${p.name}: ${p.url}`);
    });

    // Summary
    const totalProducts = await query('SELECT COUNT(*) as total FROM products');
    const totalImages = await query('SELECT COUNT(*) as total FROM product_images');
    
    console.log(`\n📊 Summary:`);
    console.log(`  Total products: ${totalProducts[0].total}`);
    console.log(`  Total images: ${totalImages[0].total}`);
    console.log(`  Products without images: ${productsWithoutImages.length}`);
    console.log(`  Invalid image URLs: ${emptyImages.length + localImages.length}`);

  } catch (error) {
    console.error('❌ Error checking images:', error);
  }
  
  process.exit(0);
}

if (require.main === module) {
  checkMissingImages();
}

module.exports = { checkMissingImages };
