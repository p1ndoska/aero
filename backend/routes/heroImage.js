const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Настройка multer для загрузки изображений
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/hero');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Сохраняем с фиксированным именем
    cb(null, 'hero-bg.jpg');
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

// Получить текущее изображение
router.get('/current', (req, res) => {
  try {
    const imagePath = path.join(__dirname, '../uploads/hero/hero-bg.jpg');
    
    if (fs.existsSync(imagePath)) {
      res.json({ 
        success: true, 
        imageUrl: `/uploads/hero/hero-bg.jpg`,
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

// Загрузить новое изображение
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'Файл изображения не найден' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Изображение успешно загружено',
      imageUrl: `/uploads/hero/hero-bg.jpg`
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
router.delete('/remove', (req, res) => {
  try {
    const imagePath = path.join(__dirname, '../uploads/hero/hero-bg.jpg');
    
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

