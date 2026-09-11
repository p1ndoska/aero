const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const {authenticationToken} = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const {
  HERO_IMAGES_DIR,
  HERO_IMAGE_FILENAME,
  getHeroImagePath,
  getHeroImageUrl,
  getHeroVideoPath,
  getHeroVideoUrl,
  getHeroFallbackImagePath,
  getHeroFallbackImageUrl,
} = require('../config/paths');

// Настройка multer для загрузки изображений
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Используем конфигурируемый путь к папке hero изображений
    if (!fs.existsSync(HERO_IMAGES_DIR)) {
      fs.mkdirSync(HERO_IMAGES_DIR, { recursive: true });
    }
    cb(null, HERO_IMAGES_DIR);
  },
  filename: function (req, file, cb) {
    // Используем конфигурируемое имя файла
    cb(null, HERO_IMAGE_FILENAME);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

const heroMediaUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      if (!fs.existsSync(HERO_IMAGES_DIR)) {
        fs.mkdirSync(HERO_IMAGES_DIR, { recursive: true });
      }
      cb(null, HERO_IMAGES_DIR);
    },
    filename: function (req, file, cb) {
      const temporaryFilename = `.hero-${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1E9)}.uploading`;
      cb(null, temporaryFilename);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'video' && file.mimetype === 'video/mp4') {
      cb(null, true);
      return;
    }

    if (file.fieldname === 'fallbackImage' && file.mimetype.startsWith('image/')) {
      cb(null, true);
      return;
    }

    cb(new Error('Недопустимый тип файла для этого поля'), false);
  },
  limits: {
    fileSize: 500 * 1024 * 1024,
  },
});

// Получить текущее изображение
router.get('/current', (req, res) => {
  try {
    const imagePath = getHeroImagePath();
    
    if (fs.existsSync(imagePath)) {
      res.json({ 
        success: true, 
        imageUrl: getHeroImageUrl(),
        hasImage: true 
      });
    } else {
      res.json({ 
        success: true, 
        imageUrl: null,
        hasImage: false 
      });
    }
  } catch (error) {
    console.error('Ошибка при получении изображения:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка при получении изображения' 
    });
  }
});

router.get('/media/current', (req, res) => {
  try {
    const videoPath = getHeroVideoPath();
    const fallbackImagePath = getHeroFallbackImagePath();

    res.json({
      success: true,
      videoUrl: fs.existsSync(videoPath) ? getHeroVideoUrl() : null,
      hasVideo: fs.existsSync(videoPath),
      fallbackImageUrl: fs.existsSync(fallbackImagePath) ? getHeroFallbackImageUrl() : null,
      hasFallbackImage: fs.existsSync(fallbackImagePath),
    });
  } catch (error) {
    console.error('Ошибка при получении hero media:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при получении медиа верхнего блока',
    });
  }
});

router.post(
  '/media/video',
  authenticationToken,
  checkRole(['SUPER_ADMIN', 'MEDIA_ADMIN']),
  heroMediaUpload.single('video'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'MP4-файл видео не найден',
        });
      }

      fs.renameSync(req.file.path, getHeroVideoPath());

      res.json({
        success: true,
        message: 'Видео верхнего блока успешно загружено',
        videoUrl: getHeroVideoUrl(),
      });
    } catch (error) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      console.error('Ошибка при загрузке hero video:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка при загрузке видео верхнего блока',
      });
    }
  },
);

router.post(
  '/media/fallback-image',
  authenticationToken,
  checkRole(['SUPER_ADMIN', 'MEDIA_ADMIN']),
  heroMediaUpload.single('fallbackImage'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Файл изображения не найден',
        });
      }

      fs.renameSync(req.file.path, getHeroFallbackImagePath());

      res.json({
        success: true,
        message: 'Изображение fallback успешно загружено',
        fallbackImageUrl: getHeroFallbackImageUrl(),
      });
    } catch (error) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      console.error('Ошибка при загрузке fallback image:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка при загрузке изображения верхнего блока',
      });
    }
  },
);

// Загрузить новое изображение
router.post('/upload', authenticationToken, checkRole(['SUPER_ADMIN', 'MEDIA_ADMIN']), upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'Файл изображения не найден' 
      });
    }

    const imagePath = getHeroImagePath();
    
    // Проверяем, что файл действительно сохранился
    if (!fs.existsSync(imagePath)) {
      console.error('Файл не найден после загрузки:', imagePath);
      return res.status(500).json({ 
        success: false, 
        error: 'Файл не был сохранен на сервере' 
      });
    }

    console.log('Hero image успешно загружено:', imagePath);
    console.log('Размер файла:', fs.statSync(imagePath).size, 'байт');

    res.json({ 
      success: true, 
      message: 'Изображение успешно загружено',
      imageUrl: getHeroImageUrl()
    });
  } catch (error) {
    console.error('Ошибка при загрузке изображения:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка при загрузке изображения' 
    });
  }
});

// Удалить текущее изображение
router.delete('/remove', authenticationToken, checkRole(['SUPER_ADMIN', 'MEDIA_ADMIN']), (req, res) => {
  try {
    const imagePath = getHeroImagePath();
    
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      res.json({ 
        success: true, 
        message: 'Изображение успешно удалено' 
      });
    } else {
      res.json({ 
        success: true, 
        message: 'Изображение не найдено' 
      });
    }
  } catch (error) {
    console.error('Ошибка при удалении изображения:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка при удалении изображения' 
    });
  }
});

module.exports = router;
