/**
 * Конфигурация путей для файлов и изображений
 * Все пути настраиваются через переменные окружения
 */

const path = require('path');

// Базовый путь к директории uploads (абсолютный путь)
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');

// URL префикс для доступа к загруженным файлам (например, '/uploads')
const UPLOADS_URL_PREFIX = process.env.UPLOADS_URL_PREFIX || '/uploads';

// Путь к директории для hero изображений
const HERO_IMAGES_DIR = process.env.HERO_IMAGES_DIR || path.join(UPLOADS_DIR, 'hero');

// Путь к директории для документов
const DOCUMENTS_DIR = process.env.DOCUMENTS_DIR || path.join(UPLOADS_DIR, 'documents');

// Имя файла hero изображения
const HERO_IMAGE_FILENAME = process.env.HERO_IMAGE_FILENAME || 'hero-bg.jpg';

module.exports = {
  UPLOADS_DIR,
  UPLOADS_URL_PREFIX,
  HERO_IMAGES_DIR,
  DOCUMENTS_DIR,
  HERO_IMAGE_FILENAME,
  // Вспомогательные функции
  getUploadsPath: (relativePath) => {
    return path.join(UPLOADS_DIR, relativePath);
  },
  getHeroImagePath: () => {
    return path.join(HERO_IMAGES_DIR, HERO_IMAGE_FILENAME);
  },
  getHeroImageUrl: () => {
    return `${UPLOADS_URL_PREFIX}/hero/${HERO_IMAGE_FILENAME}`;
  },
  normalizeUploadPath: (rawPath) => {
    // Нормализует путь к файлу для использования в URL
    if (!rawPath) return null;
    const normalized = rawPath.replace(/\\/g, '/');
    
    // Если путь уже содержит полный URL (http:// или https://), извлекаем относительный путь
    if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
      // Извлекаем путь после домена (например, из https://localhost:8443/uploads/image.jpg получаем /uploads/image.jpg)
      try {
        const url = new URL(normalized);
        const path = url.pathname;
        // Если путь уже начинается с UPLOADS_URL_PREFIX, возвращаем как есть
        if (path.startsWith(UPLOADS_URL_PREFIX)) {
          return path;
        }
        // Иначе добавляем префикс
        return `${UPLOADS_URL_PREFIX}${path.startsWith('/') ? path : '/' + path}`;
      } catch (e) {
        // Если не удалось распарсить URL, пытаемся извлечь путь вручную
        const match = normalized.match(/\/uploads\/[^\/]+/);
        if (match) {
          return match[0];
        }
        // Если не нашли, возвращаем как есть, но это не должно происходить
        return normalized;
      }
    }
    
    // Если путь уже содержит полный путь к uploads, извлекаем относительный путь
    const uploadsDirNormalized = UPLOADS_DIR.replace(/\\/g, '/');
    if (normalized.includes(uploadsDirNormalized)) {
      const relativePath = normalized.split(uploadsDirNormalized).pop().replace(/^\/+/, '');
      return `${UPLOADS_URL_PREFIX}/${relativePath}`;
    }
    
    // Если путь начинается с 'uploads/', добавляем префикс
    if (normalized.startsWith('uploads/')) {
      return `${UPLOADS_URL_PREFIX}/${normalized.replace(/^uploads\//, '')}`;
    }
    
    // Если путь уже начинается с префикса URL, возвращаем как есть
    if (normalized.startsWith(UPLOADS_URL_PREFIX)) {
      return normalized;
    }
    
    // Если путь начинается с '/', но не с префиксом, заменяем на правильный префикс
    if (normalized.startsWith('/')) {
      return `${UPLOADS_URL_PREFIX}${normalized}`;
    }
    
    // Иначе добавляем префикс
    return `${UPLOADS_URL_PREFIX}/${normalized}`;
  }
};

