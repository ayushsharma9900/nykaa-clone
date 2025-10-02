const fetch = require('node-fetch');

async function testAPI() {
  const baseURL = process.env.NODE_ENV === 'production' 
    ? 'https://nykaa-clone-steel.vercel.app' 
    : 'http://localhost:3000';
  
  console.log('🧪 Testing API endpoints...');
  console.log('Base URL:', baseURL);
  
  try {
    // Test products API
    console.log('\n📦 Testing /api/products...');
    const productsResponse = await fetch(`${baseURL}/api/products`);
    const productsData = await productsResponse.json();
    
    if (productsData.success) {
      console.log('✅ Products API working');
      console.log(`📊 Found ${productsData.data?.length || 0} products`);
      if (productsData.data?.length > 0) {
        console.log(`🎯 Sample product: ${productsData.data[0].name}`);
      }
    } else {
      console.log('❌ Products API failed:', productsData.message);
    }
    
    // Test categories API
    console.log('\n📁 Testing /api/categories...');
    const categoriesResponse = await fetch(`${baseURL}/api/categories`);
    const categoriesData = await categoriesResponse.json();
    
    if (categoriesData.success) {
      console.log('✅ Categories API working');
      console.log(`📊 Found ${categoriesData.data?.length || 0} categories`);
      if (categoriesData.data?.length > 0) {
        console.log(`🎯 Sample category: ${categoriesData.data[0].name}`);
      }
    } else {
      console.log('❌ Categories API failed:', categoriesData.message);
    }
    
  } catch (error) {
    console.log('💥 API test failed:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  testAPI().then(() => {
    console.log('\n🏁 API test completed');
  });
}

module.exports = testAPI;
