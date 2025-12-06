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
    nameEn: 'Company news',
    nameBe: 'Навіны прадпрыемства'
  },
  {
    name: 'Безопасность полётов',
    nameEn: 'Flight safety',
    nameBe: 'Бяспека палётаў'
  },
  {
    name: 'Информационная безопасность',
    nameEn: 'Information security',
    nameBe: 'Інфармацыйная бяспека'
  },
  {
    name: 'МЧС информирует',
    nameEn: 'Emercom informs',
    nameBe: 'МНС інфармуе'
  },
  {
    name: 'МВД информирует',
    nameEn: 'MIA informs',
    nameBe: 'УУС інфармуе'
  },
  {
    name: 'Энергосбережение',
    nameEn: 'Energy saving',
    nameBe: 'Энергазберажэнне'
  }
];

async function seedNewsCategories() {
  try {
    console.log('Проверяем категории новостей...');

    // Получаем список правильных названий категорий из seed-файла
    const validCategoryNames = newsCategories.map(cat => cat.name);

    // Проверяем, существуют ли уже категории
    const existingCategories = await prisma.newsCategory.findMany();

    if (existingCategories.length === 0) {
      console.log('Первый запуск: создаем категории новостей...');
    } else {
      console.log(`Найдено существующих категорий: ${existingCategories.length} шт.`);
      console.log('Существующие категории:');
      existingCategories.forEach(cat => {
        console.log(`  - "${cat.name}" (ID: ${cat.id})`);
      });
      
      // Находим категории, которых нет в списке правильных
      const invalidCategories = existingCategories.filter(
        cat => !validCategoryNames.includes(cat.name)
      );

      if (invalidCategories.length > 0) {
        console.log(`\nНайдено ${invalidCategories.length} категорий с неправильными названиями:`);
        invalidCategories.forEach(cat => console.log(`  - "${cat.name}" (ID: ${cat.id})`));

        // Проверяем, есть ли новости в неправильных категориях
        for (const invalidCat of invalidCategories) {
          const newsCount = await prisma.news.count({
            where: { categoryId: invalidCat.id }
          });

          if (newsCount > 0) {
            console.log(`  ⚠ В категории "${invalidCat.name}" есть ${newsCount} новостей. Они будут удалены вместе с категорией.`);
          }
        }

        // Удаляем неправильные категории (с каскадным удалением новостей)
        for (const invalidCat of invalidCategories) {
          try {
            // Сначала удаляем все новости в этой категории
            await prisma.news.deleteMany({
              where: { categoryId: invalidCat.id }
            });

            // Затем удаляем саму категорию
            await prisma.newsCategory.delete({
              where: { id: invalidCat.id }
            });

            console.log(`  ✓ Удалена категория "${invalidCat.name}"`);
          } catch (error) {
            console.error(`  ✗ Ошибка при удалении категории "${invalidCat.name}":`, error.message);
          }
        }
      }

      console.log('\nСоздаем/обновляем категории из seed-файла...');
    }

    // Создаем или обновляем все категории из списка
    const processedCategories = [];

    for (const categoryData of newsCategories) {
      try {
        // Используем upsert для создания или обновления категории по имени
        const category = await prisma.newsCategory.upsert({
          where: { name: categoryData.name },
          update: {
            nameEn: categoryData.nameEn,
            nameBe: categoryData.nameBe
          },
          create: categoryData
        });

        processedCategories.push(category);
        const wasCreated = existingCategories.length === 0 || 
          !existingCategories.find(c => c.name === categoryData.name);
        console.log(`✓ Категория "${category.name}" ${wasCreated ? 'создана' : 'обновлена'}`);
      } catch (error) {
        console.error(`✗ Ошибка при обработке категории "${categoryData.name}":`, error.message);
      }
    }

    console.log(`\nУспешно обработано ${processedCategories.length} категорий новостей`);

    // Выводим список обработанных категорий
    if (processedCategories.length > 0) {
      console.log('\nКатегории новостей из seed-файла:');
      processedCategories.forEach((category, index) => {
        console.log(`${index + 1}. ${category.name}`);
        if (category.nameEn) console.log(`   EN: ${category.nameEn}`);
        if (category.nameBe) console.log(`   BE: ${category.nameBe}`);
      });
    }

  } catch (error) {
    console.error('Ошибка при создании категорий новостей:', error);
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
        console.log('Скрипт создания категорий новостей завершен');
        process.exit(0);
      })
      .catch((error) => {
        console.error('Скрипт завершился с ошибкой:', error);
        process.exit(1);
      });
}