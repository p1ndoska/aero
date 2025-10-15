const fetch = require('node-fetch');

async function testBackend() {
  try {
    console.log('Testing backend connection...');
    
    // Test if server is running
    const response = await fetch('http://localhost:3000/api/branch', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 401) {
      console.log('✅ Backend is running - got 401 (Unauthorized) as expected');
    } else if (response.status === 404) {
      console.log('❌ Backend is running but route not found');
    } else {
      console.log('✅ Backend is running - status:', response.status);
    }
    
  } catch (error) {
    console.log('❌ Backend is not running or not accessible:', error.message);
  }
}

testBackend();



