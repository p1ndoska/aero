# Настройка Email уведомлений

## Переменные окружения

Добавьте следующие переменные в файл `.env`:

```env
# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
ADMIN_EMAIL="admin@belaeronavigatsia.by"
```

## Настройка Gmail

1. Включите двухфакторную аутентификацию в вашем Google аккаунте
2. Создайте пароль приложения:
   - Перейдите в настройки Google аккаунта
   - Безопасность → Пароли приложений
   - Создайте новый пароль для приложения
   - Используйте этот пароль в `SMTP_PASS`

## Настройка других SMTP провайдеров

### Yandex
```env
SMTP_HOST="smtp.yandex.ru"
SMTP_PORT=587
SMTP_USER="your-email@yandex.ru"
SMTP_PASS="your-password"
```

### Mail.ru
```env
SMTP_HOST="smtp.mail.ru"
SMTP_PORT=587
SMTP_USER="your-email@mail.ru"
SMTP_PASS="your-password"
```

### Outlook/Hotmail
```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT=587
SMTP_USER="your-email@outlook.com"
SMTP_PASS="your-password"
```

## Функциональность

При записи на прием отправляются два email:

1. **Подтверждение пользователю** - красивое HTML письмо с деталями приема
2. **Уведомление администратору** - уведомление о новой записи

## Тестирование

Для тестирования email отправки можно использовать сервисы:
- [Mailtrap](https://mailtrap.io/) - для разработки
- [Ethereal Email](https://ethereal.email/) - для тестирования

## Логи

Email сервис логирует:
-  Успешную отправку писем
-  Ошибки отправки
- Проверку подключения к SMTP серверу
