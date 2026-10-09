const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = require('../prisma/prisma-client');

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const TYPE_TITLES = {
  registration: 'Заявление о регистрации ELT',
  deregistration: 'Заявление о снятии с регистрации ELT',
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isPdfType = !file.mimetype || ['application/pdf', 'application/octet-stream'].includes(file.mimetype);
    if (ext !== '.pdf' || !isPdfType) {
      return cb(new Error('Прикрепите файл в формате PDF'));
    }
    cb(null, true);
  },
  limits: { fileSize: MAX_FILE_SIZE },
});

const str = (value) => (value === null || value === undefined ? '' : String(value).trim());

async function readAndRemove(filePath) {
  try {
    return await fs.promises.readFile(filePath);
  } finally {
    fs.unlink(filePath, () => {});
  }
}

// Принимает скан подписанного заявления (поле scan, PDF) и данные формы (поле formData, JSON):
// сохраняет заявление в БД вместе со сформированными PDF и Excel и отправляет все три файла на почту
function scanSubmitHandlers({ type, createPdf, createExcel, sendEmail }) {
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
      if (req.file.buffer.subarray(0, 5).toString() !== '%PDF-') {
        return res.status(400).json({ error: 'Прикрепите файл в формате PDF' });
      }

      let formData;
      try {
        formData = JSON.parse(req.body.formData || '{}');
      } catch {
        return res.status(400).json({ error: 'Некорректные данные формы' });
      }

      const eltCode = Array.isArray(formData.eltCode) ? formData.eltCode.join('') : str(formData.eltCode);
      if (eltCode.length !== 15) {
        return res.status(400).json({ error: 'Заполните 15-значный код ELT' });
      }

      try {
        const scanFileName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
        const pdfFile = await createPdf(formData);
        const { filePath } = await createExcel(formData);
        const excelFile = await readAndRemove(filePath);

        const { id } = await prisma.eltApplication.create({
          data: {
            type,
            eltCode,
            operator: str(formData.operator) || null,
            aircraftRegistration: str(formData.aircraftRegistration) || null,
            formData,
            scanFileName,
            scanFile: req.file.buffer,
            pdfFile,
            excelFile,
          },
          select: { id: true },
        });

        const baseName = `${TYPE_TITLES[type]} №${id}`;
        const emailResult = await sendEmail(formData, [
          { filename: `${baseName}.pdf`, content: pdfFile, contentType: 'application/pdf' },
          { filename: `Скан - ${scanFileName}`, content: req.file.buffer, contentType: 'application/pdf' },
          { filename: `${baseName}.xlsx`, content: excelFile },
        ]).catch((error) => ({ success: false, error: error.message }));

        await prisma.eltApplication.update({
          where: { id },
          data: {
            emailSent: Boolean(emailResult.success),
            emailError: emailResult.success ? null : str(emailResult.error) || 'Ошибка отправки письма',
          },
        });

        res.json({ success: true, id, emailSent: Boolean(emailResult.success), message: 'Заявление отправлено' });
      } catch (error) {
        console.error('Ошибка при сохранении заявления ELT:', error);
        res.status(500).json({ error: 'Ошибка при отправке заявления', details: error.message });
      }
    },
  ];
}

module.exports = { scanSubmitHandlers };
