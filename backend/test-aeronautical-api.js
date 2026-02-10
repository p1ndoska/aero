const axios = require('axios');

async function testAeronauticalAPI() {
  try {
    console.log('🧪 Testing aeronautical info categories API...');
    
    // Тестируем без авторизации сначала
    const response = await axios.get('http://localhost:3000/api/aeronautical-info-categories');
    console.log(' API Response:', response.data);
    console.log(`Found ${response.data.length} categories`);
    
  } catch (error) {
    console.error(' API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔐 API requires authentication. This is expected.');
    }
  }
}

testAeronauticalAPI();
