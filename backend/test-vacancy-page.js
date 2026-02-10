// Тест для проверки, что VacancyPageContentController доступен
const VacancyPageContentController = require('./controllers/VacancyPageContentController');

console.log('=== Проверка VacancyPageContentController ===');
console.log('Контроллер загружен:', !!VacancyPageContentController);
console.log('Метод getPageContent:', typeof VacancyPageContentController.getPageContent);
console.log('Метод updatePageContent:', typeof VacancyPageContentController.updatePageContent);

if (typeof VacancyPageContentController.getPageContent === 'function') {
    console.log(' Контроллер корректен!');
} else {
    console.log(' Проблема с контроллером!');
}

// Проверка экспорта в index.js
const controllers = require('./controllers');
console.log('\n=== Проверка экспорта в controllers/index.js ===');
console.log('VacancyPageContentController экспортирован:', !!controllers.VacancyPageContentController);

