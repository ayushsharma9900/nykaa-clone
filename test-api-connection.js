// Quick API connection test
const API_URL = 'http://localhost:5001/api';

async function testAPI() {
  console.log('Testing API connection...\n');
  
  const endpoints = [
    '/health',
    '/categories',
    '/products?limit=1'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`);
      const data = await response.json();
      console.log(`✓ ${endpoint}: ${response.status}`, data.success ? 'OK' : 'FAILED');
    } catch (error) {
      console.log(`✗ ${endpoint}: ${error.message}`);
    }
  }
}

testAPI();
