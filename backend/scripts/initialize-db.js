/**
 * Скрипт инициализации базы данных при запуске приложения
 * Создает начальные данные, если они отсутствуют
 * Запускает все seed скрипты из папки scripts
 */

const { PrismaClient } = require('@prisma/client');
const { ensureDatabase } = require('./ensure-database');
const { seedNewsCategories } = require('./seed-news-categories');
const { seedAboutCompanyCategories } = require('./seed-about-company-categories');
const { seedSocialWorkCategories } = require('./seed-social-categories');
const { seedAeronauticalInfoCategories } = require('./seed-aeronautical-info-categories');
const { seedAppealsCategories } = require('./seed-appeals-categories');
const { seedServicesCategories } = require('./seed-services-categories');
const { updateAboutCompanyPageContentTitles } = require('./update-about-company-page-content-titles');
const { updateSocialWorkPageContentTitles } = require('./update-social-work-page-content-titles');
const { addQualityQuestionnaireCategories } = require('./add-quality-questionnaire-categories');
const { seedHomeServiceCards } = require('./seed-home-service-cards');

const prisma = new PrismaClient();

async function seedRolesAndSuperAdmin() {
  const bcrypt = require('bcrypt');
  const roles = [
    'SUPER_ADMIN',
    'NEWS_ADMIN',
    'ABOUT_ADMIN',
    'SERVICES_ADMIN',
    'AIRNAV_ADMIN',
    'APPEALS_ADMIN',
    'SOCIAL_ADMIN',
    'MEDIA_ADMIN',
    'USER'
  ];

  // Seed roles
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Ensure SUPER_ADMIN user exists
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@local';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!';
  const superRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
  if (!superRole) throw new Error('SUPER_ADMIN role not found after seed');

  const hashed = bcrypt.hashSync(superAdminPassword, 10);
  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: { 
      roleId: superRole.id, 
      password: hashed,
    },
    create: {
      email: superAdminEmail,
      password: hashed,
      role: { connect: { id: superRole.id } },
      firstName: 'Super',
      lastName: 'Admin',
      isActive: true,
      mustChangePassword: true,
      passwordChangedAt: new Date(),
    },
  });

  console.log('Roles seeded:', roles.length);
  console.log('SUPER_ADMIN ready:', superAdminEmail);
}

async function initializeDatabase() {
  try {
    console.log('🚀 Начало инициализации базы данных...');
    
    // 0. Проверяем и создаем базу данных, если её нет
    console.log('\n🔍 Шаг 0: Проверка базы данных...');
    try {
      await ensureDatabase();
      console.log(' База данных проверена');
    } catch (error) {
      console.error(' Ошибка при проверке базы данных:', error.message);
      // Продолжаем, возможно база уже существует
      console.log('⚠️  Продолжаем инициализацию...');
    }
    
    // 1. Создаем роли и супер-админа
    console.log('\n📋 Шаг 1: Создание ролей и супер-администратора...');
    try {
      await seedRolesAndSuperAdmin();
      console.log(' Роли и супер-администратор созданы');
    } catch (error) {
      console.error(' Ошибка при создании ролей:', error.message);
      throw error;
    }
    
    // 2. Создаем категории новостей
    console.log('\n📰 Шаг 2: Создание категорий новостей...');
    try {
      await seedNewsCategories();
      console.log(' Категории новостей созданы');
    } catch (error) {
      console.error(' Ошибка при создании категорий новостей:', error.message);
      throw error;
    }
    
    // 3. Создаем категории "О предприятии"
    console.log('\n🏢 Шаг 3: Создание категорий "О предприятии"...');
    try {
      await seedAboutCompanyCategories();
      console.log(' Категории "О предприятии" созданы');
    } catch (error) {
      console.error(' Ошибка при создании категорий "О предприятии":', error.message);
      throw error;
    }
    
    // 4. Создаем категории социальной работы
    console.log('\n👥 Шаг 4: Создание категорий социальной работы...');
    try {
      await seedSocialWorkCategories();
      console.log(' Категории социальной работы созданы');
    } catch (error) {
      console.error(' Ошибка при создании категорий социальной работы:', error.message);
      throw error;
    }
    
    // 5. Создаем категории аэронавигационной информации
    console.log('\n✈️ Шаг 5: Создание категорий аэронавигационной информации...');
    try {
      await seedAeronauticalInfoCategories();
      console.log(' Категории аэронавигационной информации созданы');
    } catch (error) {
      console.error(' Ошибка при создании категорий аэронавигационной информации:', error.message);
      throw error;
    }
    
    // 6. Создаем категории обращений
    console.log('\n📝 Шаг 6: Создание категорий обращений...');
    try {
      await seedAppealsCategories();
      console.log(' Категории обращений созданы');
    } catch (error) {
      console.error(' Ошибка при создании категорий обращений:', error.message);
      throw error;
    }
    
    // 7. Создаем категории услуг
    console.log('\n🔧 Шаг 7: Создание категорий услуг...');
    try {
      await seedServicesCategories();
      console.log(' Категории услуг созданы');
    } catch (error) {
      console.error(' Ошибка при создании категорий услуг:', error.message);
      throw error;
    }
    
    // 8. Обновляем заголовки страниц "О предприятии"
    console.log('\n📄 Шаг 8: Обновление заголовков страниц "О предприятии"...');
    try {
      await updateAboutCompanyPageContentTitles();
      console.log(' Заголовки страниц "О предприятии" обновлены');
    } catch (error) {
      console.warn('⚠️ Предупреждение при обновлении заголовков "О предприятии":', error.message);
      // Не прерываем выполнение, это не критично
    }
    
    // 9. Обновляем заголовки страниц социальной работы
    console.log('\n📄 Шаг 9: Обновление заголовков страниц социальной работы...');
    try {
      await updateSocialWorkPageContentTitles();
      console.log(' Заголовки страниц социальной работы обновлены');
    } catch (error) {
      console.warn('⚠️ Предупреждение при обновлении заголовков социальной работы:', error.message);
      // Не прерываем выполнение, это не критично
    }
    
    // 10. Создаем категории анкет качества
    console.log('\n📋 Шаг 10: Создание категорий анкет качества...');
    try {
      await addQualityQuestionnaireCategories();
      console.log(' Категории анкет качества созданы');
    } catch (error) {
      console.warn('⚠️ Предупреждение при создании категорий анкет качества:', error.message);
      // Не прерываем выполнение, это не критично
    }

    // 11. Создаем карточки услуг на главной при пустой таблице
    console.log('\n🃏 Шаг 11: Создание карточек услуг на главной...');
    try {
      await seedHomeServiceCards();
      console.log(' Карточки услуг на главной проверены');
    } catch (error) {
      console.warn('⚠️ Предупреждение при создании карточек услуг:', error.message);
    }
    
    console.log('\n База данных успешно инициализирована!');
    console.log('📊 Все скрипты выполнены успешно');
  } catch (error) {
    console.error('\n Критическая ошибка при инициализации базы данных:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { initializeDatabase };

// Если скрипт запускается напрямую
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('\n🎉 Инициализация завершена успешно');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Инициализация завершилась с ошибкой:', error);
      process.exit(1);
    });
}
