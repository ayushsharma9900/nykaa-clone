const fetch = require('node-fetch');

async function testAuth() {
  const baseURL = process.env.NODE_ENV === 'production' 
    ? 'https://nykaa-clone-steel.vercel.app' 
    : 'http://localhost:3000';
  
  console.log('🔐 Testing authentication system...');
  console.log('Base URL:', baseURL);
  
  try {
    // Test login with correct credentials
    console.log('\n✅ Testing login with correct credentials...');
    const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@dashtar.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginData.success && loginData.token) {
      console.log('✅ Login successful!');
      console.log('👤 User:', loginData.user?.name);
      console.log('🎫 Token received (first 20 chars):', loginData.token.substring(0, 20) + '...');
      
      // Test token validation
      console.log('\n🔍 Testing token validation...');
      const meResponse = await fetch(`${baseURL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      });
      
      const meData = await meResponse.json();
      
      if (meData.success) {
        console.log('✅ Token validation successful!');
        console.log('👤 Validated user:', meData.data?.user?.name);
      } else {
        console.log('❌ Token validation failed:', meData.message);
      }
      
    } else {
      console.log('❌ Login failed:', loginData.message);
    }
    
    // Test login with wrong credentials
    console.log('\n❌ Testing login with wrong credentials...');
    const badLoginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'wrong@email.com',
        password: 'wrongpass'
      })
    });
    
    const badLoginData = await badLoginResponse.json();
    
    if (!badLoginData.success) {
      console.log('✅ Correctly rejected wrong credentials');
    } else {
      console.log('❌ Should have rejected wrong credentials!');
    }
    
  } catch (error) {
    console.log('💥 Auth test failed:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  testAuth().then(() => {
    console.log('\n🏁 Auth test completed');
  });
}

module.exports = testAuth;
