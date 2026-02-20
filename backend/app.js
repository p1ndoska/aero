require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require('fs');
const cors = require('cors');
const { initializeDatabase } = require('./scripts/initialize-db');

const app = express();

// CORS middleware
// Разрешаем запросы с локального dev сервера, Docker и доменного имени
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

// Базовый список разрешенных origins
const baseOrigins = [
  'http://localhost:5173',      // Vite dev server (локальная разработка)
  'https://localhost:8443',     // Docker production
  'http://localhost:3000',      // Альтернативный порт
  'http://localhost:8080',      // HTTP порт Docker
  'http://192.168.1.39:8443',
];

// Функция для извлечения домена из URL
const extractDomain = (url) => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return null;
  }
};

// Функция для генерации всех возможных вариантов URL для домена
const generateDomainUrls = (domain) => {
  if (!domain) return [];
  const urls = [];
  // Добавляем HTTP и HTTPS варианты
  urls.push(`http://${domain}`);
  urls.push(`https://${domain}`);
  // Добавляем с портами 80, 443, 8080, 8443
  urls.push(`http://${domain}:80`);
  urls.push(`https://${domain}:443`);
  urls.push(`http://${domain}:8080`);
  urls.push(`https://${domain}:8443`);
  return urls;
};

// Извлекаем домен из FRONTEND_URL
const frontendDomain = extractDomain(process.env.FRONTEND_URL);
const domainUrls = frontendDomain ? generateDomainUrls(frontendDomain) : [];

// В development режиме добавляем FRONTEND_URL только если он не https://localhost:8443
// В production используем FRONTEND_URL и все варианты домена
const allowedOrigins = isDevelopment
  ? [...baseOrigins, process.env.FRONTEND_URL, ...domainUrls].filter(url => 
      url && url !== 'https://localhost:8443' // Исключаем Docker URL в dev режиме
    )
  : [...baseOrigins, process.env.FRONTEND_URL, ...domainUrls].filter(Boolean);

// Логируем разрешенные origins при запуске
console.log('🌐 CORS настроен. Разрешенные origins:', allowedOrigins);
console.log('🌐 NODE_ENV:', process.env.NODE_ENV || 'не установлен (считается development)');
console.log('🌐 FRONTEND_URL:', process.env.FRONTEND_URL || 'не установлен');
console.log('🌐 Frontend Domain:', frontendDomain || 'не определен');
console.log('🌐 isDevelopment:', isDevelopment);

app.use(cors({
  origin: function (origin, callback) {
    // Разрешаем запросы без origin (например, Postman, curl, мобильные приложения)
    if (!origin) {
      console.log(' CORS: Запрос без origin разрешен');
      return callback(null, true);
    }
    
    // Логируем все запросы
    console.log(`🔍 CORS: Запрос от origin: ${origin}`);
    console.log(`   isDevelopment: ${isDevelopment}`);
    
    // В режиме разработки разрешаем все localhost origins (приоритет!)
    if (isDevelopment && origin.includes('localhost')) {
      console.log(` CORS: Localhost origin разрешен (dev mode): ${origin}`);
      // ВАЖНО: Возвращаем сам origin, а не true, чтобы заголовок был правильным
      return callback(null, origin);
    }
    
    // Проверяем, есть ли origin в списке разрешенных
    if (allowedOrigins.includes(origin)) {
      console.log(` CORS: Origin разрешен из списка: ${origin}`);
      // ВАЖНО: Возвращаем сам origin, а не true
      return callback(null, origin);
    }
    
    // Проверяем, соответствует ли origin домену из FRONTEND_URL
    if (frontendDomain) {
      try {
        const originUrl = new URL(origin);
        const originDomain = originUrl.hostname;
        
        // Разрешаем запросы с того же домена (без учета поддоменов для основного домена)
        if (originDomain === frontendDomain || originDomain.endsWith('.' + frontendDomain)) {
          console.log(` CORS: Origin разрешен по домену: ${origin} (домен: ${originDomain})`);
          return callback(null, origin);
        }
      } catch (e) {
        // Если не удалось распарсить URL, продолжаем проверку
      }
    }
    
    // Логируем отклоненные запросы
    console.log(` CORS: Запрос отклонен от origin: ${origin}`);
    console.log(`   Разрешенные origins: ${allowedOrigins.join(', ')}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// view engine setup
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Настройка раздачи статических файлов uploads
// Используем абсолютный путь для надежности в Docker
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('📁 Created uploads directory:', uploadsPath);
} else {
  console.log('📁 Uploads directory exists:', uploadsPath);
  // Проверяем содержимое папки
  try {
    const files = fs.readdirSync(uploadsPath);
    console.log('📁 Files in uploads directory:', files.slice(0, 10), files.length > 10 ? `... (${files.length} total)` : '');
  } catch (err) {
    console.error(' Error reading uploads directory:', err.message);
  }
}
app.use('/uploads', express.static(uploadsPath, {
  etag: true,
  lastModified: true,
  maxAge: 0, // Отключаем кэширование для uploads
  setHeaders: (res, filePath) => {
    console.log('📤 Serving static file:', filePath);
    // Добавляем заголовки для предотвращения кэширования
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));
console.log('📁 Static files (uploads) served from:', uploadsPath);
console.log('📁 __dirname:', __dirname);

// Инициализация базы данных при запуске
initializeDatabase().catch(error => {
  console.error(' Ошибка при инициализации базы данных:', error);
});

app.use('/api', require('./routes'));
app.use('/api/hero-image', require('./routes/heroImage'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;