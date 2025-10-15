# Руководство по многоязычной системе сайта

## 📋 Обзор

Сайт поддерживает три языка:
- 🇷🇺 **Русский** (ru) - язык по умолчанию
- 🇺🇸 **Английский** (en)
- 🇧🇾 **Беларуский** (be)

## 🎯 Основные компоненты

### 1. **LanguageContext** (`frontend/src/contexts/LanguageContext.tsx`)

Центральный контекст для управления языком и переводами.

**Основные функции:**
- `language` - текущий выбранный язык
- `setLanguage(lang)` - установить новый язык
- `t(key)` - функция перевода (возвращает перевод для ключа)

**Пример использования:**
```typescript
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('about_company')}</p>
    </div>
  );
}
```

### 2. **FloatingLanguageSwitcher** (`frontend/src/components/FloatingLanguageSwitcher.tsx`)

Переключатель языков в правом верхнем углу.

**Как работает:**
- Круглая кнопка с иконкой глобуса
- Код текущего языка под кнопкой (RU/EN/BE)
- Клик циклически меняет язык: RU → EN → BE → RU

### 3. **Словарь переводов**

Все переводы хранятся в объекте `translations` внутри `LanguageContext.tsx`.

**Структура:**
```typescript
const translations = {
  ru: {
    'key': 'Перевод на русском',
    // ...
  },
  en: {
    'key': 'Translation in English',
    // ...
  },
  be: {
    'key': 'Пераклад на беларускай',
    // ...
  }
};
```

## 📝 Как добавить новый перевод

### Шаг 1: Добавьте ключ в словарь

Откройте `frontend/src/contexts/LanguageContext.tsx` и добавьте новый ключ во все три языка:

```typescript
const translations = {
  ru: {
    // ... существующие переводы
    'new_key': 'Новый текст на русском',
  },
  en: {
    // ... существующие переводы
    'new_key': 'New text in English',
  },
  be: {
    // ... существующие переводы
    'new_key': 'Новы тэкст на беларускай',
  }
};
```

### Шаг 2: Используйте в компоненте

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { t } = useLanguage();
  
  return <h1>{t('new_key')}</h1>;
}
```

## 🔑 Доступные ключи переводов

### Общие
- `welcome`, `home`, `about`, `news`, `activity`, `air_navigation`, `services`, `contacts`
- `search`, `login`, `logout`, `admin_panel`
- `loading`, `error`, `no_data`, `read_more`, `back`, `save`, `cancel`, `delete`, `edit`, `add`, `close`

### О предприятии
- `about_company`, `management`, `structure`, `branches`, `security_policy`, `history`, `vacancies`

### Новости
- `all_news`, `company_news`, `flight_safety`, `information_security`, `emergency`, `police`, `energy_saving`

### Деятельность
- `international`, `standards`, `hr_policy`, `information_systems`, `training_center`, `airport`, `support`, `quality_policy`, `anti_corruption`, `regulations`

### Аэронавигация
- `eaip`, `eaip_vfr`, `etod`, `aip_supplements`, `notam`, `aircraft_operations`, `air_traffic_services`, `aeronautical_information`, `airspace`, `airports`, `radio_navigation`, `weather`, `search_rescue`, `aircraft_accidents`

### Услуги
- `air_navigation_services`, `meteorological_services`, `aeronautical_information_services`, `search_rescue_services`, `training_services`, `consulting_services`, `technical_support`

### Контакты
- `address`, `phone`, `email`, `working_hours`, `minsk_address`, `working_time`

### Вакансии
- `vacancy_title`, `vacancy_subtitle`, `apply`, `details`, `requirements`, `conditions`, `salary`, `location`, `employment_type`

### Cookie
- `cookie_title`, `cookie_message`, `cookie_policy_link`, `accept_all`, `reject`, `settings`, `cookies`
- `necessary_cookies`, `necessary_cookies_description`
- `functional_cookies`, `functional_cookies_description`
- `analytics_cookies`, `analytics_cookies_description`
- `marketing_cookies`, `marketing_cookies_description`
- `save_preferences`

### Админ панель
- `user_management`, `role_management`, `news_management`, `category_management`, `branch_management`, `vacancy_management`, `management_management`

## 🔄 Как работает сохранение языка

1. При выборе языка он сохраняется в `localStorage` браузера
2. При следующем посещении сайта язык автоматически восстанавливается
3. Атрибут `lang` HTML-документа автоматически обновляется

## 🎨 Обновленные компоненты

Следующие компоненты уже поддерживают переводы:

1. **Sidebar** (`frontend/src/components/Sidebar.tsx`)
   - Меню навигации
   - Кнопки входа/выхода
   - Контактная информация
   - Поле поиска

2. **CookieConsent** (`frontend/src/components/CookieConsent.tsx`)
   - Баннер согласия на cookie
   - Настройки cookie

3. **App** (`frontend/src/App.tsx`)
   - Главная страница
   - Заголовки новостей

4. **FloatingLanguageSwitcher** (`frontend/src/components/FloatingLanguageSwitcher.tsx`)
   - Переключатель языков в правом верхнем углу

## 📦 Структура файлов

```
frontend/src/
├── contexts/
│   └── LanguageContext.tsx          # Контекст языка и переводы
├── types/
│   └── language.ts                   # Тип Language
├── components/
│   ├── FloatingLanguageSwitcher.tsx # Переключатель языков
│   ├── Sidebar.tsx                  # Обновлен для поддержки переводов
│   ├── CookieConsent.tsx            # Обновлен для поддержки переводов
│   └── ...
├── main.tsx                         # LanguageProvider оборачивает приложение
└── App.tsx                          # Обновлен для поддержки переводов
```

## 🚀 Быстрый старт для разработчиков

### 1. Добавить перевод в новый компонент

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

export default function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('my_title')}</h1>
      <p>{t('my_description')}</p>
      <button>{t('save')}</button>
    </div>
  );
}
```

### 2. Получить текущий язык

```typescript
const { language } = useLanguage();
console.log(language); // 'ru', 'en' или 'be'
```

### 3. Программно изменить язык

```typescript
const { setLanguage } = useLanguage();

// Установить английский
setLanguage('en');

// Установить беларуский
setLanguage('be');
```

## ⚠️ Важные замечания

1. **Всегда добавляйте переводы для всех трех языков** - это обеспечит корректную работу сайта
2. **Используйте осмысленные ключи** - например, `user_name` вместо `text1`
3. **Группируйте переводы по темам** - используйте комментарии в словаре
4. **Fallback**: Если перевод не найден, функция `t()` вернет сам ключ

## 🔍 Тестирование

Для проверки переводов:

1. Откройте сайт
2. Нажмите на кнопку глобуса в правом верхнем углу
3. Язык изменится циклически: RU → EN → BE → RU
4. Проверьте, что все тексты на странице изменились

## 📞 Поддержка

При возникновении проблем или вопросов:
- Проверьте консоль браузера на наличие ошибок
- Убедитесь, что все ключи переводов присутствуют во всех языках
- Проверьте, что компонент обернут в `LanguageProvider`

