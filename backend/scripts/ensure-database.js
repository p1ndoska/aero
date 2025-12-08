/**
 * Скрипт для проверки и создания базы данных
 * Убеждается, что база данных существует перед применением миграций
 */

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function ensureDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL не установлен в переменных окружения!');
  }

  console.log('🔍 Проверка DATABASE_URL...');
  console.log(`   URL: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`); // Скрываем пароль
  
  // Парсим DATABASE_URL
  const urlMatch = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  if (!urlMatch) {
    throw new Error('Неверный формат DATABASE_URL!');
  }

  const [, user, password, host, port, database] = urlMatch;
  
  console.log(`   Хост: ${host}`);
  console.log(`   Порт: ${port}`);
  console.log(`   База данных: ${database}`);
  console.log(`   Пользователь: ${user}`);
  
  if (database === 'prisma') {
    console.error('❌ ОШИБКА: DATABASE_URL указывает на базу данных "prisma"!');
    console.error('   Должно быть "mydb"');
    console.error('   Проверьте переменную окружения DATABASE_URL');
    throw new Error('Неправильное имя базы данных в DATABASE_URL');
  }

  // Пытаемся подключиться к базе данных
  console.log('\n🔌 Попытка подключения к базе данных...');
  
  try {
    // Подключаемся к базе данных postgres для проверки существования нашей БД
    const adminUrl = databaseUrl.replace(`/${database}`, '/postgres');
    const adminPrisma = new PrismaClient({
      datasources: {
        db: { url: adminUrl }
      }
    });

    // Проверяем, существует ли база данных
    const result = await adminPrisma.$queryRaw`
      SELECT 1 FROM pg_database WHERE datname = ${database}
    `;
    
    if (!result || result.length === 0) {
      console.log(`\n📦 База данных "${database}" не найдена, создаем...`);
      await adminPrisma.$executeRawUnsafe(`CREATE DATABASE "${database}"`);
      console.log(`✅ База данных "${database}" успешно создана`);
    } else {
      console.log(`✅ База данных "${database}" уже существует`);
    }
    
    await adminPrisma.$disconnect();
  } catch (error) {
    // Если не удалось подключиться к postgres, пробуем подключиться напрямую
    console.log('⚠️  Не удалось подключиться к postgres, пробуем прямое подключение...');
    
    try {
      const prisma = new PrismaClient();
      await prisma.$connect();
      console.log('✅ Подключение к базе данных успешно');
      await prisma.$disconnect();
    } catch (connectError) {
      if (connectError.code === 'P1003' || connectError.message.includes('does not exist')) {
        console.log(`\n📦 База данных "${database}" не существует, создаем...`);
        // Пытаемся создать через psql
        try {
          const createDbUrl = databaseUrl.replace(`/${database}`, '/postgres');
          const createPrisma = new PrismaClient({
            datasources: {
              db: { url: createDbUrl }
            }
          });
          await createPrisma.$executeRawUnsafe(`CREATE DATABASE "${database}"`);
          await createPrisma.$disconnect();
          console.log(`✅ База данных "${database}" успешно создана`);
        } catch (createError) {
          console.error('❌ Ошибка при создании базы данных:', createError.message);
          throw createError;
        }
      } else {
        throw connectError;
      }
    }
  }

  console.log('\n✅ База данных готова к работе');
}

module.exports = { ensureDatabase };

// Если скрипт запускается напрямую
if (require.main === module) {
  ensureDatabase()
    .then(() => {
      console.log('\n🎉 Проверка базы данных завершена успешно');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Ошибка при проверке базы данных:', error);
      process.exit(1);
    });
}

