const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { UPLOADS_DIR } = require('../config/paths');

const ALLOWED_EXTENSIONS = ['.pdf'];
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `elt-scan-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isPdfType = !file.mimetype || ['application/pdf', 'application/octet-stream'].includes(file.mimetype);
    if (!ALLOWED_EXTENSIONS.includes(ext) || !isPdfType) {
      return cb(new Error('Прикрепите файл в формате PDF'));
    }
    cb(null, true);
  },
  limits: { fileSize: MAX_FILE_SIZE },
});

// Принимает скан подписанного заявления (поле scan) и данные формы (поле formData, JSON) и отправляет их на почту
function scanSubmitHandlers(sendEmail) {
  return [
    (req, res, next) => {
      upload.single('scan')(req, res, (err) => {
        if (err) {
          const message = err.code === 'LIMIT_FILE_SIZE' ? 'Файл больше 20 МБ' : err.message;
          return res.status(400).json({ error: message });
        }
        next();
      });
    },
    async (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: 'Прикрепите отсканированный документ' });
      }

      try {
        let formData = {};
        try {
          formData = JSON.parse(req.body.formData || '{}');
        } catch {
          return res.status(400).json({ error: 'Некорректные данные формы' });
        }

        const signature = Buffer.alloc(5);
        const fd = fs.openSync(req.file.path, 'r');
        fs.readSync(fd, signature, 0, 5, 0);
        fs.closeSync(fd);
        if (signature.toString() !== '%PDF-') {
          return res.status(400).json({ error: 'Прикрепите файл в формате PDF' });
        }

        const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
        const result = await sendEmail(formData, req.file.path, originalName);

        if (!result.success) {
          return res.status(500).json({ error: 'Ошибка при отправке заявления', details: result.error });
        }

        res.json({ success: true, message: 'Заявление отправлено' });
      } catch (error) {
        console.error('Ошибка при отправке скана заявления ELT:', error);
        res.status(500).json({ error: 'Ошибка при отправке заявления', details: error.message });
      } finally {
        fs.unlink(req.file.path, () => {});
      }
    },
  ];
}

module.exports = { scanSubmitHandlers };
