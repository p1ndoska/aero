// Тестовый скрипт для проверки API филиалов
const fetch = require('node-fetch');

async function testBranchAPI() {
  const baseUrl = 'http://localhost:3000/api';
  
  console.log('🧪 Тестирование API филиалов...\n');
  
  // 1. Проверим, работает ли сервер
  try {
    console.log('1️⃣ Проверка доступности сервера...');
    const response = await fetch(`${baseUrl}/branch`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Статус: ${response.status}`);
    console.log(`   Заголовки:`, Object.fromEntries(response.headers.entries()));
    
    if (response.status === 401) {
      console.log('   ✅ Сервер работает - получили 401 (Unauthorized) как ожидалось');
    } else if (response.status === 404) {
      console.log('   ❌ Сервер работает, но маршрут не найден');
    } else {
      console.log('   ⚠️  Неожиданный статус:', response.status);
    }
    
  } catch (error) {
    console.log('   ❌ Сервер недоступен:', error.message);
    console.log('   💡 Убедитесь, что backend запущен на порту 3000');
    return;
  }
  
  // 2. Проверим создание филиала
  console.log('\n2️⃣ Тестирование создания филиала...');
  try {
    const testBranch = {
      name: 'Тестовый филиал',
      address: 'Тестовый адрес',
      phone: '+375 29 123-45-67',
      email: 'test@example.com',
      description: 'Тестовое описание'
    };
    
    const response = await fetch(`${baseUrl}/branch`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testBranch)
    });
    
    console.log(`   Статус: ${response.status}`);
    const responseText = await response.text();
    console.log(`   Ответ: ${responseText}`);
    
    if (response.status === 401) {
      console.log('   ✅ API работает - нужна аутентификация');
    } else if (response.status === 400) {
      console.log('   ✅ API работает - валидация работает');
    } else {
      console.log('   ⚠️  Неожиданный ответ');
    }
    
  } catch (error) {
    console.log('   ❌ Ошибка при тестировании:', error.message);
  }
  
  console.log('\n🔍 Диагностика:');
  console.log('   - Если сервер недоступен: запустите "cd backend && npm start"');
  console.log('   - Если 401: проверьте токен аутентификации');
  console.log('   - Если 404: проверьте маршруты в backend/routes/index.js');
  console.log('   - Если 500: проверьте логи backend сервера');
}

testBranchAPI();



