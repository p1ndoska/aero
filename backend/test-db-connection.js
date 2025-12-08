/**
 * Скрипт для проверки подключения к базе данных
 * Запустите: node test-db-connection.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 Проверка подключения к базе данных...\n');
  
  // Проверка DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ ОШИБКА: DATABASE_URL не установлен!');
    console.error('\nСоздайте файл backend/.env со следующим содержимым:');
    console.error('DATABASE_URL="postgresql://prisma:prisma@localhost:5432/mydb?schema=public"');
    process.exit(1);
  }
  
  console.log('📋 DATABASE_URL найден:');
  console.log(`   ${databaseUrl.replace(/:[^:@]+@/, ':****@')}\n`);
  
  // Парсим URL
  const urlMatch = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  if (!urlMatch) {
    console.error('❌ ОШИБКА: Неверный формат DATABASE_URL!');
    console.error('   Ожидается: postgresql://user:password@host:port/database?schema=public');
    process.exit(1);
  }
  
  const [, user, password, host, port, database] = urlMatch;
  console.log('📊 Параметры подключения:');
  console.log(`   Хост: ${host}`);
  console.log(`   Порт: ${port}`);
  console.log(`   База данных: ${database}`);
  console.log(`   Пользователь: ${user}\n`);
  
  // Проверка хоста
  if (host !== 'localhost' && host !== '127.0.0.1') {
    console.warn('⚠️  ВНИМАНИЕ: Хост не localhost!');
    console.warn(`   Для локальной разработки используйте: localhost`);
    console.warn(`   Текущий хост: ${host}\n`);
  }
  
  // Попытка подключения
  console.log('🔌 Попытка подключения...\n');
  
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
  
  try {
    // Подключаемся к БД
    await prisma.$connect();
    console.log('✅ Подключение к базе данных успешно!\n');
    
    // Проверяем, что БД существует и доступна
    try {
      const result = await prisma.$queryRaw`SELECT version()`;
      console.log('✅ База данных доступна');
      console.log(`   PostgreSQL версия: ${result[0].version.split(' ')[0]} ${result[0].version.split(' ')[1]}\n`);
    } catch (error) {
      console.error('❌ Ошибка при выполнении запроса:', error.message);
    }
    
    // Проверяем наличие таблиц
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
      
      if (tables.length > 0) {
        console.log(`✅ Найдено таблиц: ${tables.length}`);
        console.log('   Первые 5 таблиц:');
        tables.slice(0, 5).forEach(table => {
          console.log(`   - ${table.table_name}`);
        });
        if (tables.length > 5) {
          console.log(`   ... и еще ${tables.length - 5}`);
        }
      } else {
        console.log('⚠️  Таблицы не найдены. Возможно, нужно применить миграции:');
        console.log('   npx prisma migrate deploy');
      }
    } catch (error) {
      console.warn('⚠️  Не удалось получить список таблиц:', error.message);
    }
    
    console.log('\n✅ Все проверки пройдены успешно!');
    console.log('   Локальный сервер должен работать корректно.\n');
    
  } catch (error) {
    console.error('\n❌ ОШИБКА подключения к базе данных!\n');
    console.error('Детали ошибки:');
    console.error(`   Код: ${error.code || 'N/A'}`);
    console.error(`   Сообщение: ${error.message}\n`);
    
    // Полезные советы
    console.log('🔧 Возможные решения:\n');
    
    if (error.code === 'ECONNREFUSED' || error.message.includes('connect ECONNREFUSED')) {
      console.log('1. Проверьте, что контейнер PostgreSQL запущен:');
      console.log('   docker ps | findstr aero-postgres\n');
      console.log('2. Если контейнер не запущен, запустите его:');
      console.log('   docker start aero-postgres\n');
      console.log('3. Проверьте, что порт 5432 проброшен:');
      console.log('   docker port aero-postgres\n');
    }
    
    if (error.code === 'P1001' || error.message.includes('Can\'t reach database server')) {
      console.log('1. Проверьте, что контейнер доступен на localhost:5432');
      console.log('2. Проверьте firewall настройки');
      console.log('3. Убедитесь, что порт 5432 не занят другой БД\n');
    }
    
    if (error.code === 'P1000' || error.message.includes('Authentication failed')) {
      console.log('1. Проверьте правильность пароля в DATABASE_URL');
      console.log('2. Убедитесь, что пользователь и пароль совпадают с настройками контейнера\n');
    }
    
    if (error.code === 'P1003' || error.message.includes('does not exist')) {
      console.log('1. База данных не существует. Создайте её:');
      console.log('   docker exec -it aero-postgres psql -U prisma -c "CREATE DATABASE mydb;"\n');
    }
    
    console.log('4. Проверьте DATABASE_URL в backend/.env файле');
    console.log('5. Убедитесь, что Prisma Client сгенерирован:');
    console.log('   npx prisma generate\n');
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск
testConnection()
  .then(() => {
    console.log('🎉 Проверка завершена');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
  });

