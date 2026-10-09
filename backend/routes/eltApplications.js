const express = require('express');
const prisma = require('../prisma/prisma-client');
const { authenticationToken } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

const router = express.Router();
const access = [authenticationToken, checkRole(['SUPER_ADMIN', 'SERVICES_ADMIN'])];

const LIST_FIELDS = {
  id: true,
  type: true,
  eltCode: true,
  operator: true,
  aircraftRegistration: true,
  scanFileName: true,
  emailSent: true,
  emailError: true,
  createdAt: true,
};

const FILES = {
  pdf: { field: 'pdfFile', ext: '.pdf', contentType: 'application/pdf' },
  excel: { field: 'excelFile', ext: '.xlsx', contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  scan: { field: 'scanFile', ext: '.pdf', contentType: 'application/pdf' },
};

const TYPE_FILE_NAMES = {
  registration: 'Заявление о регистрации ELT',
  deregistration: 'Заявление о снятии с регистрации ELT',
};

const parseId = (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'Некорректный ID' });
    return null;
  }
  return id;
};

// GET /api/elt-applications?type=registration|deregistration
router.get('/', ...access, async (req, res) => {
  try {
    const where = TYPE_FILE_NAMES[req.query.type] ? { type: req.query.type } : {};
    const applications = await prisma.eltApplication.findMany({ where, select: LIST_FIELDS, orderBy: { createdAt: 'desc' } });
    res.json(applications);
  } catch (error) {
    console.error('Ошибка при получении заявлений ELT:', error);
    res.status(500).json({ error: 'Ошибка при получении заявлений' });
  }
});

// GET /api/elt-applications/:id
router.get('/:id', ...access, async (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;
  try {
    const application = await prisma.eltApplication.findUnique({ where: { id }, select: { ...LIST_FIELDS, formData: true } });
    if (!application) return res.status(404).json({ error: 'Заявление не найдено' });
    res.json(application);
  } catch (error) {
    console.error('Ошибка при получении заявления ELT:', error);
    res.status(500).json({ error: 'Ошибка при получении заявления' });
  }
});

// GET /api/elt-applications/:id/files/:kind (pdf | scan | excel)
router.get('/:id/files/:kind', ...access, async (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;
  const file = FILES[req.params.kind];
  if (!file) return res.status(400).json({ error: 'Неизвестный тип файла' });

  try {
    const application = await prisma.eltApplication.findUnique({
      where: { id },
      select: { type: true, scanFileName: true, [file.field]: true },
    });
    if (!application) return res.status(404).json({ error: 'Заявление не найдено' });

    const fileName = req.params.kind === 'scan'
      ? application.scanFileName
      : `${TYPE_FILE_NAMES[application.type] || 'Заявление ELT'} №${id}${file.ext}`;

    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="elt-${id}${file.ext}"; filename*=UTF-8''${encodeURIComponent(fileName)}`);
    res.send(Buffer.from(application[file.field]));
  } catch (error) {
    console.error('Ошибка при скачивании файла заявления ELT:', error);
    res.status(500).json({ error: 'Ошибка при скачивании файла' });
  }
});

// DELETE /api/elt-applications/:id
router.delete('/:id', ...access, async (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;
  try {
    await prisma.eltApplication.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Заявление не найдено' });
    console.error('Ошибка при удалении заявления ELT:', error);
    res.status(500).json({ error: 'Ошибка при удалении заявления' });
  }
});

module.exports = router;
