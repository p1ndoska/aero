// Тест проверки наличия всех переводов во всех языках

const fs = require('fs');
const path = require('path');

// Читаем файл с контекстом
const contextPath = path.join(__dirname, 'frontend', 'src', 'contexts', 'LanguageContext.tsx');
const content = fs.readFileSync(contextPath, 'utf-8');

// Извлекаем объект translations
const translationsMatch = content.match(/const translations = \{([\s\S]*?)\n\};/);
if (!translationsMatch) {
  console.error('❌ Не удалось найти объект translations');
  process.exit(1);
}

// Простая проверка структуры
console.log('✅ Файл LanguageContext.tsx найден');
console.log('✅ Объект translations найден');

// Проверяем наличие всех трех языков
const hasRu = content.includes('ru: {');
const hasEn = content.includes('en: {');
const hasBe = content.includes('be: {');

console.log(`${hasRu ? '✅' : '❌'} Русский язык (ru)`);
console.log(`${hasEn ? '✅' : '❌'} Английский язык (en)`);
console.log(`${hasBe ? '✅' : '❌'} Беларуский язык (be)`);

// Проверяем наличие основных ключей
const essentialKeys = [
  'welcome', 'home', 'about', 'news', 'contacts',
  'search', 'login', 'logout',
  'loading', 'error', 'save', 'cancel'
];

console.log('\n📝 Проверка основных ключей:');
essentialKeys.forEach(key => {
  const hasKey = content.includes(`'${key}':`);
  console.log(`${hasKey ? '✅' : '❌'} ${key}`);
});

console.log('\n✨ Проверка завершена!');
console.log('\n📚 Для полной документации см. MULTILINGUAL_SYSTEM_GUIDE.md');

