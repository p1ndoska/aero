const prisma = require('../prisma/prisma-client');
const path = require('path');
const fs = require('fs');

// Загрузка резюме
const uploadResume = async (req, res) => {
  try {
    console.log('ResumeController.uploadResume called');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'Файл не был загружен' });
    }

    const { fullName, email, phone } = req.body;

    if (!fullName || !email) {
      // Удаляем загруженный файл, если данные неполные
      if (req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'ФИО и Email обязательны для заполнения' });
    }

    const resume = await prisma.resume.create({
      data: {
        fullName,
        email,
        phone: phone || null,
        fileUrl: `/uploads/${req.file.filename}`,
        fileName: req.file.originalname,
        status: 'NEW',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Резюме успешно загружено',
      resume,
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    console.error('Error name:', error.name);
    
    // Удаляем загруженный файл в случае ошибки
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    // Отправляем более детальную информацию об ошибке
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Ошибка при загрузке резюме: ${error.message}` 
      : 'Ошибка при загрузке резюме';
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : undefined
    });
  }
};

// Получить все резюме (для админки)
const getAllResumes = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [resumes, total] = await Promise.all([
      prisma.resume.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.resume.count({ where }),
    ]);

    res.json({
      resumes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ error: 'Ошибка при получении резюме' });
  }
};

// Получить одно резюме
const getResumeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const resume = await prisma.resume.findUnique({
      where: { id: parseInt(id) },
    });

    if (!resume) {
      return res.status(404).json({ error: 'Резюме не найдено' });
    }

    res.json(resume);
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ error: 'Ошибка при получении резюме' });
  }
};

// Обновить статус резюме
const updateResumeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Статус обязателен' });
    }

    const validStatuses = ['NEW', 'VIEWED', 'CONTACTED', 'ARCHIVED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Недопустимый статус' });
    }

    const resume = await prisma.resume.update({
      where: { id: parseInt(id) },
      data: {
        status,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    res.json({
      success: true,
      message: 'Статус резюме обновлен',
      resume,
    });
  } catch (error) {
    console.error('Error updating resume status:', error);
    res.status(500).json({ error: 'Ошибка при обновлении статуса резюме' });
  }
};

// Удалить резюме
const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    
    const resume = await prisma.resume.findUnique({
      where: { id: parseInt(id) },
    });

    if (!resume) {
      return res.status(404).json({ error: 'Резюме не найдено' });
    }

    // Удаляем файл
    const filePath = path.join(__dirname, '..', resume.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Удаляем запись из БД
    await prisma.resume.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: 'Резюме удалено',
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ error: 'Ошибка при удалении резюме' });
  }
};

// Получить статистику резюме
const getResumeStats = async (req, res) => {
  try {
    const [total, newCount, viewedCount, contactedCount, archivedCount] = await Promise.all([
      prisma.resume.count(),
      prisma.resume.count({ where: { status: 'NEW' } }),
      prisma.resume.count({ where: { status: 'VIEWED' } }),
      prisma.resume.count({ where: { status: 'CONTACTED' } }),
      prisma.resume.count({ where: { status: 'ARCHIVED' } }),
    ]);

    res.json({
      total,
      byStatus: {
        new: newCount,
        viewed: viewedCount,
        contacted: contactedCount,
        archived: archivedCount,
      },
    });
  } catch (error) {
    console.error('Error fetching resume stats:', error);
    res.status(500).json({ error: 'Ошибка при получении статистики резюме' });
  }
};

module.exports = {
  uploadResume,
  getAllResumes,
  getResumeById,
  updateResumeStatus,
  deleteResume,
  getResumeStats,
};

