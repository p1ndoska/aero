const prisma = require('../prisma/prisma-client');
const path = require('path');
const fs = require('fs');
const { UPLOADS_URL_PREFIX, UPLOADS_DIR } = require('../config/paths');

const ELTDocumentController = {
  // Загрузить документ договора ELT
  uploadDocument: async (req, res) => {
    try {
      const pageType = 'elt-registration-services';
      
      if (!req.file) {
        return res.status(400).json({ error: 'Файл не был загружен' });
      }

      const fileUrl = `${UPLOADS_URL_PREFIX}/documents/${req.file.filename}`;
      // Убеждаемся, что путь правильный для статических файлов
      const fileName = req.file.originalname;

      // Обновляем или создаем запись страницы контента
      const pageContent = await prisma.servicesPageContent.upsert({
        where: { pageType },
        update: {
          documentUrl: fileUrl,
          documentName: fileName
        },
        create: {
          pageType,
          title: 'ОКАЗАНИЕ УСЛУГ ПО РЕГИСТРАЦИИ (ПЕРЕРЕГИСТРАЦИИ, СНЯТИЮ С РЕГИСТРАЦИИ) ELT',
          documentUrl: fileUrl,
          documentName: fileName
        }
      });

      res.json({
        success: true,
        message: 'Документ успешно загружен',
        documentUrl: fileUrl,
        documentName: fileName,
        pageContent
      });
    } catch (error) {
      console.error('Ошибка при загрузке документа:', error);
      res.status(500).json({ error: 'Ошибка при загрузке документа' });
    }
  },

  // Получить документ договора ELT
  getDocument: async (req, res) => {
    try {
      const pageType = 'elt-registration-services';
      
      const pageContent = await prisma.servicesPageContent.findUnique({
        where: { pageType },
        select: {
          documentUrl: true,
          documentName: true
        }
      });

      if (!pageContent || !pageContent.documentUrl) {
        // Возвращаем null вместо 404, чтобы не вызывать ошибку на фронтенде
        return res.json(null);
      }

      res.json({
        documentUrl: pageContent.documentUrl,
        documentName: pageContent.documentName
      });
    } catch (error) {
      console.error('Ошибка при получении документа:', error);
      res.status(500).json({ error: 'Ошибка при получении документа' });
    }
  },

  // Удалить документ договора ELT
  deleteDocument: async (req, res) => {
    try {
      const pageType = 'elt-registration-services';
      
      const pageContent = await prisma.servicesPageContent.findUnique({
        where: { pageType }
      });

      if (!pageContent || !pageContent.documentUrl) {
        return res.status(404).json({ error: 'Документ не найден' });
      }

      // Удаляем файл с диска
      // Убираем префикс URL для получения относительного пути
      const relativePath = pageContent.documentUrl.replace(new RegExp(`^${UPLOADS_URL_PREFIX}/`), '');
      const filePath = path.join(UPLOADS_DIR, relativePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Обновляем запись в базе данных
      await prisma.servicesPageContent.update({
        where: { pageType },
        data: {
          documentUrl: null,
          documentName: null
        }
      });

      res.json({ success: true, message: 'Документ успешно удален' });
    } catch (error) {
      console.error('Ошибка при удалении документа:', error);
      res.status(500).json({ error: 'Ошибка при удалении документа' });
    }
  },

  // Загрузить документ инструкции ELT
  uploadInstruction: async (req, res) => {
    try {
      const pageType = 'elt-registration-services';
      
      if (!req.file) {
        return res.status(400).json({ error: 'Файл не был загружен' });
      }

      const fileUrl = `${UPLOADS_URL_PREFIX}/documents/${req.file.filename}`;
      const fileName = req.file.originalname;

      // Обновляем или создаем запись страницы контента
      const pageContent = await prisma.servicesPageContent.upsert({
        where: { pageType },
        update: {
          instructionUrl: fileUrl,
          instructionName: fileName
        },
        create: {
          pageType,
          title: 'ОКАЗАНИЕ УСЛУГ ПО РЕГИСТРАЦИИ (ПЕРЕРЕГИСТРАЦИИ, СНЯТИЮ С РЕГИСТРАЦИИ) ELT',
          instructionUrl: fileUrl,
          instructionName: fileName
        }
      });

      res.json({
        success: true,
        message: 'Документ инструкции успешно загружен',
        instructionUrl: fileUrl,
        instructionName: fileName,
        pageContent
      });
    } catch (error) {
      console.error('Ошибка при загрузке документа инструкции:', error);
      res.status(500).json({ error: 'Ошибка при загрузке документа инструкции' });
    }
  },

  // Получить документ инструкции ELT
  getInstruction: async (req, res) => {
    try {
      const pageType = 'elt-registration-services';
      
      const pageContent = await prisma.servicesPageContent.findUnique({
        where: { pageType },
        select: {
          instructionUrl: true,
          instructionName: true
        }
      });

      if (!pageContent || !pageContent.instructionUrl) {
        return res.json(null);
      }

      res.json({
        instructionUrl: pageContent.instructionUrl,
        instructionName: pageContent.instructionName
      });
    } catch (error) {
      console.error('Ошибка при получении документа инструкции:', error);
      res.status(500).json({ error: 'Ошибка при получении документа инструкции' });
    }
  },

  // Удалить документ инструкции ELT
  deleteInstruction: async (req, res) => {
    try {
      const pageType = 'elt-registration-services';
      
      const pageContent = await prisma.servicesPageContent.findUnique({
        where: { pageType }
      });

      if (!pageContent || !pageContent.instructionUrl) {
        return res.status(404).json({ error: 'Документ инструкции не найден' });
      }

      // Удаляем файл с диска
      // Убираем префикс URL для получения относительного пути
      const relativePath = pageContent.instructionUrl.replace(new RegExp(`^${UPLOADS_URL_PREFIX}/`), '');
      const filePath = path.join(UPLOADS_DIR, relativePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Обновляем запись в базе данных
      await prisma.servicesPageContent.update({
        where: { pageType },
        data: {
          instructionUrl: null,
          instructionName: null
        }
      });

      res.json({ success: true, message: 'Документ инструкции успешно удален' });
    } catch (error) {
      console.error('Ошибка при удалении документа инструкции:', error);
      res.status(500).json({ error: 'Ошибка при удалении документа инструкции' });
    }
  }
};

module.exports = ELTDocumentController;

