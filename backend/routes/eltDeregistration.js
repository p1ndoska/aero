const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const emailService = require('../utils/emailService');
const path = require('path');
const fs = require('fs');
const { UPLOADS_DIR } = require('../config/paths');

// Функция для создания Excel файла из данных формы снятия с регистрации
async function createELTDeregistrationExcelFile(formData) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Заявление о снятии с регистрации ELT');

  // Настройка колонок
  worksheet.columns = [
    { header: 'Поле', key: 'field', width: 40 },
    { header: 'Значение', key: 'value', width: 50 }
  ];

  // Стиль для заголовков
  const headerStyle = {
    font: { bold: true, size: 12 },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF213659' }
    },
    alignment: { vertical: 'middle', horizontal: 'center' },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };

  const cellStyle = {
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    },
    alignment: { vertical: 'middle', horizontal: 'left', wrapText: true }
  };

  // Применяем стиль к заголовкам
  worksheet.getRow(1).font = headerStyle.font;
  worksheet.getRow(1).fill = headerStyle.fill;
  worksheet.getRow(1).alignment = headerStyle.alignment;
  worksheet.getRow(1).border = headerStyle.border;
  worksheet.getRow(1).height = 25;

  let rowNumber = 2;

  // Информация по ELT
  worksheet.getCell(`A${rowNumber}`).value = 'ИНФОРМАЦИЯ ПО ELT';
  worksheet.getCell(`A${rowNumber}`).font = { bold: true };
  rowNumber++;
  worksheet.getCell(`A${rowNumber}`).value = '15-ЗНАЧНЫЙ ШЕСТНАДЦАТЕРИЧНЫЙ КОД ПОСЫЛКИ';
  worksheet.getCell(`B${rowNumber}`).value = formData.eltCode.join('');
  rowNumber++;
  worksheet.getCell(`A${rowNumber}`).value = 'Модель';
  worksheet.getCell(`B${rowNumber}`).value = formData.eltModel;
  rowNumber++;
  worksheet.getCell(`A${rowNumber}`).value = 'Заводской номер';
  worksheet.getCell(`B${rowNumber}`).value = formData.eltSerialNumber;
  rowNumber++;

  // Информация о воздушном судне
  worksheet.getCell(`A${rowNumber}`).value = 'ИНФОРМАЦИЯ О ВОЗДУШНОМ СУДНЕ';
  worksheet.getCell(`A${rowNumber}`).font = { bold: true };
  rowNumber++;
  worksheet.getCell(`A${rowNumber}`).value = 'Тип воздушного судна';
  worksheet.getCell(`B${rowNumber}`).value = formData.aircraftType;
  rowNumber++;
  worksheet.getCell(`A${rowNumber}`).value = 'Модель воздушного судна';
  worksheet.getCell(`B${rowNumber}`).value = formData.aircraftModel;
  rowNumber++;
  worksheet.getCell(`A${rowNumber}`).value = 'Регистрационный знак воздушного судна';
  worksheet.getCell(`B${rowNumber}`).value = formData.aircraftRegistration;
  rowNumber++;

  // Информация об эксплуатанте
  worksheet.getCell(`A${rowNumber}`).value = 'ИНФОРМАЦИЯ ОБ ЭКСПЛУАТАНТЕ ВОЗДУШНОГО СУДНА';
  worksheet.getCell(`A${rowNumber}`).font = { bold: true };
  rowNumber++;
  worksheet.getCell(`A${rowNumber}`).value = 'Эксплуатант воздушного судна';
  worksheet.getCell(`B${rowNumber}`).value = formData.operator;
  rowNumber++;
  worksheet.getCell(`A${rowNumber}`).value = 'Почтовый адрес';
  worksheet.getCell(`B${rowNumber}`).value = formData.operatorAddress;
  rowNumber++;
  worksheet.getCell(`A${rowNumber}`).value = 'Рабочий телефон';
  worksheet.getCell(`B${rowNumber}`).value = formData.operatorWorkPhone;
  rowNumber++;
  worksheet.getCell(`A${rowNumber}`).value = 'Мобильный телефон';
  worksheet.getCell(`B${rowNumber}`).value = formData.operatorMobilePhone;
  rowNumber++;
  worksheet.getCell(`A${rowNumber}`).value = 'E-mail';
  worksheet.getCell(`B${rowNumber}`).value = formData.operatorEmail;
  rowNumber++;

  // Данные ответственного за снятие с регистрации
  worksheet.getCell(`A${rowNumber}`).value = 'ДАННЫЕ ОТВЕТСТВЕННОГО ЗА СНЯТИЕ С РЕГИСТРАЦИИ ELT';
  worksheet.getCell(`A${rowNumber}`).font = { bold: true };
  rowNumber++;
  worksheet.getCell(`A${rowNumber}`).value = 'Ответственное лицо';
  worksheet.getCell(`B${rowNumber}`).value = formData.responsiblePerson;
  rowNumber++;
  worksheet.getCell(`A${rowNumber}`).value = 'Телефон';
  worksheet.getCell(`B${rowNumber}`).value = formData.responsiblePhone;
  rowNumber++;
  worksheet.getCell(`A${rowNumber}`).value = 'E-mail';
  worksheet.getCell(`B${rowNumber}`).value = formData.responsibleEmail;
  rowNumber++;

  // Реквизиты для выставления счёта
  worksheet.getCell(`A${rowNumber}`).value = 'РЕКВИЗИТЫ ДЛЯ ВЫСТАВЛЕНИЯ СЧЁТА';
  worksheet.getCell(`A${rowNumber}`).font = { bold: true };
  rowNumber++;
  worksheet.getCell(`A${rowNumber}`).value = 'Полное название организации';
  worksheet.getCell(`B${rowNumber}`).value = formData.billingFullName;
  rowNumber++;
  worksheet.getCell(`A${rowNumber}`).value = 'Сокращенное название организации';
  worksheet.getCell(`B${rowNumber}`).value = formData.billingShortName;
  rowNumber++;
  worksheet.getCell(`A${rowNumber}`).value = 'Место нахождения (юридический адрес)';
  worksheet.getCell(`B${rowNumber}`).value = formData.billingLegalAddress;
  rowNumber++;
  worksheet.getCell(`A${rowNumber}`).value = 'Почтовый адрес';
  worksheet.getCell(`B${rowNumber}`).value = formData.billingMailingAddress;
  rowNumber++;
  worksheet.getCell(`A${rowNumber}`).value = 'УНП';
  worksheet.getCell(`B${rowNumber}`).value = formData.billingUNP;
  rowNumber++;

  // Дата и подпись
  worksheet.getCell(`A${rowNumber}`).value = 'Дата';
  worksheet.getCell(`B${rowNumber}`).value = formData.date;
  rowNumber++;
  worksheet.getCell(`A${rowNumber}`).value = 'Подпись';
  worksheet.getCell(`B${rowNumber}`).value = formData.signature;
  rowNumber++;

  // Применяем стили ко всем ячейкам
  for (let i = 1; i < rowNumber; i++) {
    worksheet.getRow(i).height = 20;
    ['A', 'B'].forEach(col => {
      const cell = worksheet.getCell(`${col}${i}`);
      if (i === 1) {
        cell.font = headerStyle.font;
        cell.fill = headerStyle.fill;
        cell.alignment = headerStyle.alignment;
      } else {
        cell.border = cellStyle.border;
        cell.alignment = cellStyle.alignment;
      }
    });
  }

  // Сохраняем файл во временную директорию
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  const fileName = `elt-deregistration-${Date.now()}.xlsx`;
  const filePath = path.join(UPLOADS_DIR, fileName);
  
  await workbook.xlsx.writeFile(filePath);
  
  return { filePath, fileName };
}

// POST /api/elt-deregistration/submit
router.post('/submit', async (req, res) => {
  try {
    const formData = req.body;

    // Валидация обязательных полей
    if (!formData.eltCode || formData.eltCode.some((char) => !char)) {
      return res.status(400).json({ error: 'Заполните 15-значный код ELT' });
    }

    if (!formData.eltModel || !formData.eltSerialNumber) {
      return res.status(400).json({ error: 'Заполните информацию по ELT' });
    }

    // Создаем Excel файл
    const { filePath, fileName } = await createELTDeregistrationExcelFile(formData);

    // Отправляем email с вложением
    const emailResult = await emailService.sendELTDeregistrationEmail(formData, filePath, fileName);

    // Удаляем временный файл после отправки
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.warn('Не удалось удалить временный файл:', err);
    }

    if (!emailResult.success) {
      return res.status(500).json({ 
        error: 'Ошибка при отправке заявления',
        details: emailResult.error 
      });
    }

    res.json({ 
      success: true, 
      message: 'Заявление успешно отправлено' 
    });

  } catch (error) {
    console.error('Ошибка при обработке заявления о снятии с регистрации ELT:', error);
    res.status(500).json({ 
      error: 'Ошибка при обработке заявления',
      details: error.message 
    });
  }
});

module.exports = router;

