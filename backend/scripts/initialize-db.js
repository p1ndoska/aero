/**
 * Скрипт инициализации базы данных при запуске приложения
 * Создает начальные данные, если они отсутствуют
 */

const { seedNewsCategories } = require('./seed-news-categories');

async function initializeDatabase() {
  try {
    console.log('Проверка базы данных...');
    
    // Проверяем и создаем категории новостей при необходимости
    await seedNewsCategories();
    
    console.log('База данных готова к работе');
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
    throw error;
  }
}

module.exports = { initializeDatabase };

// Если скрипт запускается напрямую
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Инициализация завершена');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Инициализация завершилась с ошибкой:', error);
      process.exit(1);
    });
}
