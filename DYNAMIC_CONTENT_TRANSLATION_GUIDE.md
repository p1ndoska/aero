# Руководство по переводу динамического контента

## 📋 Обзор

Динамический контент (новости, вакансии, филиалы, руководство) хранится в базе данных и также поддерживает многоязычность.

## 🗄️ Структура базы данных

### Модели с поддержкой переводов:

#### 1. News (Новости)
```prisma
model News {
  name       String   // Название (русский)
  nameEn     String?  // Название (английский)
  nameBe     String?  // Название (беларуский)
  content    String?  // Контент (русский)
  contentEn  String?  // Контент (английский)
  contentBe  String?  // Контент (беларуский)
  // ...
}
```

#### 2. NewsCategory (Категории новостей)
```prisma
model NewsCategory {
  name      String   // Название (русский)
  nameEn    String?  // Название (английский)
  nameBe    String?  // Название (беларуский)
  // ...
}
```

#### 3. Branch (Филиалы)
```prisma
model Branch {
  name          String   // Название (русский)
  nameEn        String?  // Название (английский)
  nameBe        String?  // Название (беларуский)
  address       String   // Адрес (русский)
  addressEn     String?  // Адрес (английский)
  addressBe     String?  // Адрес (беларуский)
  description   String?  // Описание (русский)
  descriptionEn String?  // Описание (английский)
  descriptionBe String?  // Описание (беларуский)
  content       Json?    // Контент (русский)
  contentEn     Json?    // Контент (английский)
  contentBe     Json?    // Контент (беларуский)
  // ...
}
```

#### 4. Management (Руководство)
```prisma
model Management {
  name       String   // Имя (русский)
  nameEn     String?  // Имя (английский)
  nameBe     String?  // Имя (беларуский)
  position   String   // Должность (русский)
  positionEn String?  // Должность (английский)
  positionBe String?  // Должность (беларуский)
  offices    String?  // Кабинеты (русский)
  officesEn  String?  // Кабинеты (английский)
  officesBe  String?  // Кабинеты (беларуский)
  // ...
}
```

#### 5. Vacancy (Вакансии)
```prisma
model Vacancy {
  title            String   // Заголовок (русский)
  titleEn          String?  // Заголовок (английский)
  titleBe          String?  // Заголовок (беларуский)
  description      String   // Описание (русский)
  descriptionEn    String?  // Описание (английский)
  descriptionBe    String?  // Описание (беларуский)
  requirements     String?  // Требования (русский)
  requirementsEn   String?  // Требования (английский)
  requirementsBe   String?  // Требования (беларуский)
  conditions       String?  // Условия (русский)
  conditionsEn     String?  // Условия (английский)
  conditionsBe     String?  // Условия (беларуский)
  salary           String?  // Зарплата (русский)
  salaryEn         String?  // Зарплата (английский)
  salaryBe         String?  // Зарплата (беларуский)
  location         String?  // Местоположение (русский)
  locationEn       String?  // Местоположение (английский)
  locationBe       String?  // Местоположение (беларуский)
  employmentType   String?  // Тип занятости (русский)
  employmentTypeEn String?  // Тип занятости (английский)
  employmentTypeBe String?  // Тип занятости (беларуский)
  content          Json?    // Контент (русский)
  contentEn        Json?    // Контент (английский)
  contentBe        Json?    // Контент (беларуский)
  // ...
}
```

#### 6. VacancyPageContent (Контент страницы вакансий)
```prisma
model VacancyPageContent {
  title      String   // Заголовок (русский)
  titleEn    String?  // Заголовок (английский)
  titleBe    String?  // Заголовок (беларуский)
  subtitle   String?  // Подзаголовок (русский)
  subtitleEn String?  // Подзаголовок (английский)
  subtitleBe String?  // Подзаголовок (беларуский)
  content    Json?    // Контент (русский)
  contentEn  Json?    // Контент (английский)
  contentBe  Json?    // Контент (беларуский)
  // ...
}
```

## 🛠️ Хелперы для работы с переводами

### Файл: `frontend/src/utils/translationHelpers.ts`

#### 1. `getTranslatedField` - Получить переведенное текстовое поле

```typescript
import { getTranslatedField } from '@/utils/translationHelpers';
import { useLanguage } from '@/contexts/LanguageContext';

// Пример: получить название новости на текущем языке
const { language } = useLanguage();
const translatedTitle = getTranslatedField(news, 'name', language);
// Вернет: news.nameEn (если en), news.nameBe (если be), или news.name (если ru)
```

#### 2. `getTranslatedContent` - Получить переведенный JSON контент

```typescript
import { getTranslatedContent } from '@/utils/translationHelpers';
import { useLanguage } from '@/contexts/LanguageContext';

// Пример: получить контент филиала на текущем языке
const { language } = useLanguage();
const translatedContent = getTranslatedContent(branch, language);
// Вернет: branch.contentEn (если en), branch.contentBe (если be), или branch.content (если ru)
```

#### 3. `getTranslatedObject` - Получить переведенный объект целиком

```typescript
import { getTranslatedObject } from '@/utils/translationHelpers';
import { useLanguage } from '@/contexts/LanguageContext';

// Пример: получить объект вакансии со всеми переведенными полями
const { language } = useLanguage();
const translatedVacancy = getTranslatedObject(
  vacancy,
  ['title', 'description', 'requirements', 'conditions', 'content'],
  language
);
```

## 📝 Примеры использования

### Пример 1: Отображение новости с переводом

```typescript
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslatedField } from '@/utils/translationHelpers';

export default function NewsCard({ news }) {
  const { language, t } = useLanguage();
  
  const translatedName = getTranslatedField(news, 'name', language);
  const translatedContent = getTranslatedField(news, 'content', language);
  
  return (
    <div>
      <h3>{translatedName}</h3>
      <p>{translatedContent || t('no_data')}</p>
    </div>
  );
}
```

### Пример 2: Отображение филиала с переводом

```typescript
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslatedObject } from '@/utils/translationHelpers';

export default function BranchCard({ branch }) {
  const { language } = useLanguage();
  
  const translated = getTranslatedObject(
    branch,
    ['name', 'address', 'description', 'content'],
    language
  );
  
  return (
    <div>
      <h2>{translated.name}</h2>
      <p>{translated.address}</p>
      <p>{translated.description}</p>
      {/* Рендер контента */}
      {translated.content?.map(item => renderContentItem(item))}
    </div>
  );
}
```

### Пример 3: Отображение вакансии с переводом

```typescript
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslatedField, getTranslatedContent } from '@/utils/translationHelpers';

export default function VacancyCard({ vacancy }) {
  const { language, t } = useLanguage();
  
  return (
    <div>
      <h2>{getTranslatedField(vacancy, 'title', language)}</h2>
      <p>{getTranslatedField(vacancy, 'description', language)}</p>
      
      <h3>{t('requirements')}</h3>
      <p>{getTranslatedField(vacancy, 'requirements', language)}</p>
      
      <h3>{t('conditions')}</h3>
      <p>{getTranslatedField(vacancy, 'conditions', language)}</p>
      
      <h3>{t('salary')}</h3>
      <p>{getTranslatedField(vacancy, 'salary', language)}</p>
      
      {/* Дополнительный контент */}
      {getTranslatedContent(vacancy, language).map(item => (
        <div key={item.id}>{renderContentItem(item)}</div>
      ))}
    </div>
  );
}
```

## 🔄 Миграция базы данных

После обновления схемы необходимо применить миграцию:

```bash
cd backend
npx prisma migrate dev --name add_multilingual_support
```

## 🎯 Обновление существующих записей

После применения миграции все новые поля будут иметь значение `null`. Для существующих записей:

1. **Автоматический перевод** (опционально) - можно использовать API переводчика
2. **Ручной перевод** - через админ-панель
3. **Fallback** - если перевод не указан, используется русская версия

## ⚙️ Backend API

### Создание новости с переводами

```javascript
// POST /api/news
{
  "name": "Новость",
  "nameEn": "News",
  "nameBe": "Навіна",
  "content": "Содержание",
  "contentEn": "Content",
  "contentBe": "Змест",
  "categoryId": 1
}
```

### Обновление вакансии с переводами

```javascript
// PUT /api/vacancies/:id
{
  "title": "Вакансия",
  "titleEn": "Vacancy",
  "titleBe": "Вакансія",
  "description": "Описание",
  "descriptionEn": "Description",
  "descriptionBe": "Апісанне",
  // ...
}
```

## 📊 Админ-панель

В админ-панели нужно добавить поля для переводов:

1. **Tabs для языков** - Русский | English | Беларуская
2. **Поля для каждого языка** - отдельные поля для каждого переводимого поля
3. **Предпросмотр** - возможность переключаться между языками для предпросмотра

### Пример формы с переводами:

```typescript
<Tabs defaultValue="ru">
  <TabsList>
    <TabsTrigger value="ru">🇷🇺 Русский</TabsTrigger>
    <TabsTrigger value="en">🇺🇸 English</TabsTrigger>
    <TabsTrigger value="be">🇧🇾 Беларуская</TabsTrigger>
  </TabsList>
  
  <TabsContent value="ru">
    <Input label="Название" name="name" />
    <Textarea label="Описание" name="content" />
  </TabsContent>
  
  <TabsContent value="en">
    <Input label="Title" name="nameEn" />
    <Textarea label="Description" name="contentEn" />
  </TabsContent>
  
  <TabsContent value="be">
    <Input label="Назва" name="nameBe" />
    <Textarea label="Апісанне" name="contentBe" />
  </TabsContent>
</Tabs>
```

## ✅ Checklist для добавления переводов в новый компонент

- [ ] Импортировать `useLanguage` и хелперы
- [ ] Получить текущий язык
- [ ] Использовать `getTranslatedField` для текстовых полей
- [ ] Использовать `getTranslatedContent` для JSON полей
- [ ] Использовать `t()` для статических текстов UI
- [ ] Протестировать на всех трех языках

## 🐛 Отладка

### Проблема: Перевод не отображается

1. Проверьте, что поле перевода заполнено в базе данных
2. Проверьте правильность имени поля (titleEn, nameBe и т.д.)
3. Убедитесь, что используется правильный хелпер

### Проблема: Fallback не работает

```typescript
// ✅ Правильно - с fallback
const title = getTranslatedField(item, 'title', language) || t('no_data');

// ❌ Неправильно - без fallback
const title = getTranslatedField(item, 'title', language);
```

## 📚 Дополнительная информация

- См. `MULTILINGUAL_SYSTEM_GUIDE.md` для статических переводов
- См. `backend/prisma/schema.prisma` для полной схемы базы данных
- См. `frontend/src/utils/translationHelpers.ts` для реализации хелперов

