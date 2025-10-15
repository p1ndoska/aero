/**
 * Скрипт для создания начальных категорий новостей
 * Запускается при старте приложения для обеспечения наличия базовых категорий
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Категории новостей для создания
const newsCategories = [
  {
    name: 'Новости предприятия',
    nameEn: 'COMPANY NEWS',
    nameBe: 'НАВІНЫ ПРАДПРЫЕМСТВА'
  },
  {
    name: 'Безопасность полётов',
    nameEn: 'FLIGHT SAFETY',
    nameBe: 'БЯСПЕКА ПОЛЁТАЎ'
  },
  {
    name: 'Информационная безопасность',
    nameEn: 'INFORMATION SECURITY',
    nameBe: 'ІНФАРМАЦЫЙНАЯ БЯСПЕКА'
  },
  {
    name: 'МЧС информирует',
    nameEn: 'EMERCOM INFORMS',
    nameBe: 'МНС ІНФАРМУЕ'
  },
  {
    name: 'МВД информирует',
    nameEn: 'MIA INFORMS',
    nameBe: 'УУС ІНФАРМУЕ'
  },
  {
    name: 'энергосбережение',
    nameEn: 'ENERGY SAVING',
    nameBe: 'ЭНЕРГАЗБЕРАЖЭННЕ'
  }
];

async function seedNewsCategories() {
  try {
    console.log('🌱 Проверяем категории новостей...');

    // Проверяем, существуют ли уже категории
    const existingCategories = await prisma.newsCategory.findMany();
    
    if (existingCategories.length > 0) {
      console.log(`✅ Категории новостей уже существуют (${existingCategories.length} шт.), пропускаем создание`);
      return;
    }

    console.log('🆕 Первый запуск: создаем категории новостей...');

    // Создаем все категории
    const createdCategories = [];
    
    for (const categoryData of newsCategories) {
      try {
        const category = await prisma.newsCategory.create({
          data: categoryData
        });
        
        createdCategories.push(category);
        console.log(`✅ Создана категория: ${category.name}`);
      } catch (error) {
        console.error(`❌ Ошибка при создании категории "${categoryData.name}":`, error.message);
      }
    }

    console.log(`🎉 Успешно создано ${createdCategories.length} категорий новостей`);
    
    // Выводим список созданных категорий
    if (createdCategories.length > 0) {
      console.log('\n📋 Созданные категории новостей:');
      createdCategories.forEach((category, index) => {
        console.log(`${index + 1}. ${category.name}`);
        if (category.nameEn) console.log(`   EN: ${category.nameEn}`);
        if (category.nameBe) console.log(`   BE: ${category.nameBe}`);
      });
    }

  } catch (error) {
    console.error('❌ Ошибка при создании категорий новостей:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Экспортируем функцию для использования в других модулях
module.exports = { seedNewsCategories };

// Если скрипт запускается напрямую
if (require.main === module) {
  seedNewsCategories()
    .then(() => {
      console.log('✅ Скрипт создания категорий новостей завершен');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Скрипт завершился с ошибкой:', error);
      process.exit(1);
    });
}
