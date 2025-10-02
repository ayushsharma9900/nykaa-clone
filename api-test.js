// Simple API test to verify endpoints are working
const axios = require('axios').default;

const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');

  const tests = [
    {
      name: 'Products API',
      url: `${BASE_URL}/products?limit=2`,
      method: 'GET'
    },
    {
      name: 'Categories API', 
      url: `${BASE_URL}/categories?limit=2`,
      method: 'GET'
    },
    {
      name: 'Products by Category',
      url: `${BASE_URL}/products?category=skincare&limit=2`,
      method: 'GET'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const response = await axios({
        method: test.method,
        url: test.url,
        timeout: 10000
      });
      
      console.log(`✅ ${test.name}: OK (${response.status})`);
      console.log(`   Data items: ${response.data?.data?.length || 0}`);
      console.log(`   Success: ${response.data?.success || false}\n`);
      
    } catch (error) {
      console.log(`❌ ${test.name}: FAILED`);
      console.log(`   Error: ${error.response?.status || error.code} - ${error.message}`);
      console.log(`   Response: ${error.response?.data?.message || 'No response'}\n`);
    }
  }
}

// Only run if this is the main module
if (require.main === module) {
  testAPI().catch(console.error);
}

module.exports = { testAPI };
