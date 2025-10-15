# 🔍 Диагностика проблемы с JWT токеном

## ❌ Проблема

```
PrismaClientValidationError: Invalid `prisma.user.findUnique()` invocation:
{
  where: {
    id: undefined,  // ← userId равен undefined!
    ...
  }
}
```

## 🔍 Анализ

### **Корень проблемы:**
`req.user.userId` равен `undefined`, что означает проблему с декодированием JWT токена.

### **Цепочка вызовов:**
1. **Frontend** → отправляет токен в заголовке `Authorization: Bearer <token>`
2. **Middleware** → декодирует токен и устанавливает `req.user`
3. **Controller** → пытается получить `req.user.userId` → получает `undefined`

## 🔧 Добавленная диагностика

### 1. **Middleware аутентификации:**
```javascript
console.log('Auth middleware - authHeader:', authHeader);
console.log('Auth middleware - token:', token ? 'present' : 'missing');
console.log('JWT decoded user:', user);
```

### 2. **UserProfileController:**
```javascript
console.log('getProfile - req.user:', req.user);
console.log('getProfile - req.user.userId:', req.user.userId);
console.log('getProfile - req.user.id:', req.user.id);
const userId = req.user.userId || req.user.id; // Fallback
```

## 🎯 Возможные причины

### 1. **Токен истек:**
```javascript
// Проверьте в консоли браузера:
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token exp:', new Date(payload.exp * 1000));
console.log('Current time:', new Date());
```

### 2. **Неправильный SECRET_KEY:**
```javascript
// Проверьте в .env файле:
SECRET_KEY=your_secret_key_here
```

### 3. **Поврежденный токен:**
```javascript
// Проверьте токен:
const token = localStorage.getItem('token');
console.log('Token parts:', token.split('.'));
```

### 4. **Проблема с заголовками:**
```javascript
// Проверьте Network tab:
// Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔍 Как проверить

### 1. **Проверьте консоль бэкенда:**
Должны появиться логи:
```
Auth middleware - authHeader: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Auth middleware - token: present
JWT decoded user: { userId: 3, role: 'SUPER_ADMIN', iat: 1760111119, exp: 1760715919 }
getProfile - req.user: { userId: 3, role: 'SUPER_ADMIN', iat: 1760111119, exp: 1760715919 }
getProfile - req.user.userId: 3
getProfile - final userId: 3
```

### 2. **Проверьте токен в браузере:**
```javascript
// Выполните в консоли браузера:
const token = localStorage.getItem('token');
console.log('Token:', token);

if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Payload:', payload);
    console.log('Expires:', new Date(payload.exp * 1000));
    console.log('Is expired:', new Date() > new Date(payload.exp * 1000));
  } catch (e) {
    console.error('Invalid token format:', e);
  }
}
```

### 3. **Проверьте Network tab:**
- Заголовок `Authorization` должен присутствовать
- Токен должен быть валидным JWT

## 🚨 Возможные решения

### Если токен истек:
```javascript
// Выйдите и войдите заново
localStorage.removeItem('token');
// Или обновите токен
```

### Если SECRET_KEY неправильный:
```javascript
// Проверьте .env файл бэкенда
// Убедитесь, что SECRET_KEY одинаковый при создании и проверке токена
```

### Если токен поврежден:
```javascript
// Очистите localStorage и войдите заново
localStorage.clear();
```

## 🎯 Ожидаемый результат

### ✅ После исправления:
```
JWT decoded user: { userId: 3, role: 'SUPER_ADMIN', iat: ..., exp: ... }
getProfile - final userId: 3
GET /api/profile 200 OK
```

### ✅ Личный кабинет должен загружаться с тестовыми данными

## 🔄 Следующие шаги

1. **Проверьте логи бэкенда** - посмотрите что показывают console.log
2. **Проверьте токен в браузере** - выполните команды выше
3. **Проверьте Network tab** - убедитесь что заголовки правильные
4. **Попробуйте выйти и войти заново** - обновить токен

Попробуйте открыть личный кабинет и посмотрите на логи в консоли бэкенда! 🔍
