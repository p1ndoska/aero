const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const emailService = require('../utils/emailService');
const path = require('path');
const fs = require('fs');
const { UPLOADS_DIR } = require('../config/paths');

// Функция для создания Excel файла из данных формы
async function createELTExcelFile(formData) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Заявление о регистрации ELT');

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

  // Основание для регистрации
  worksheet.getCell(`A${rowNumber}`).value = 'ОСНОВАНИЕ ДЛЯ РЕГИСТРАЦИИ ELT';
  worksheet.getCell(`A${rowNumber}`).font = { bold: true };
  worksheet.getCell(`B${rowNumber}`).value = formData.registrationType === 'registration' ? 'регистрация ELT' : 'перерегистрация ELT';
  rowNumber++;

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
  worksheet.getCell(`A${rowNumber}`).value = 'Изготовитель';
  worksheet.getCell(`B${rowNumber}`).value = formData.eltManufacturer;
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
  worksheet.getCell(`A${rowNumber}`).value = 'Максимальное число людей на борту (экипаж и пассажиры)';
  worksheet.getCell(`B${rowNumber}`).value = formData.maxPeopleOnBoard;
  rowNumber++;

  // Информация об эксплуатанте
  worksheet.getCell(`A${rowNumber}`).value = 'ИНФОРМАЦИЯ ОБ ЭКСПЛУАТАНТЕ ВОЗДУШНОГО СУДНА';
  worksheet.getCell(`A${rowNumber}`).font = { bold: true };
  rowNumber++;
  worksheet.getCell(`A${rowNumber}`).value = 'Эксплуатант воздушного судна';
  worksheet.getCell(`B${rowNumber}`).value = formData.operator;
  rowNumber++;
  worksheet.getCell(`A${rowNumber}`).value = 'Почтовый адрес';
  worksheet.getCell(`B${rowNumber}`).value = formData.operatorAddress.filter(addr => addr).join(', ');
  rowNumber++;

  // Данные для связи в случае бедствия
  worksheet.getCell(`A${rowNumber}`).value = 'ДАННЫЕ ДЛЯ СВЯЗИ В СЛУЧАЕ БЕДСТВИЯ';
  worksheet.getCell(`A${rowNumber}`).font = { bold: true };
  rowNumber++;
  formData.emergencyContacts.forEach((contact, index) => {
    if (contact.workPhone || contact.mobilePhone || contact.email) {
      worksheet.getCell(`A${rowNumber}`).value = `Контакт ${index + 1}`;
      worksheet.getCell(`B${rowNumber}`).value = `Рабочий: ${contact.workPhone || 'не указан'}, Мобильный: ${contact.mobilePhone || 'не указан'}, Email: ${contact.email || 'не указан'}`;
      rowNumber++;
    }
  });

  // Данные ответственного за регистрацию
  worksheet.getCell(`A${rowNumber}`).value = 'ДАННЫЕ ОТВЕТСТВЕННОГО ЗА РЕГИСТРАЦИЮ';
  worksheet.getCell(`A${rowNumber}`).font = { bold: true };
  rowNumber++;
  formData.responsiblePersons.forEach((person, index) => {
    if (person.name || person.phone || person.email) {
      worksheet.getCell(`A${rowNumber}`).value = `Ответственное лицо ${index + 1}`;
      worksheet.getCell(`B${rowNumber}`).value = `Имя: ${person.name || 'не указано'}, Телефон: ${person.phone || 'не указан'}, Email: ${person.email || 'не указан'}`;
      rowNumber++;
    }
  });

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

  const fileName = `elt-registration-${Date.now()}.xlsx`;
  const filePath = path.join(UPLOADS_DIR, fileName);
  
  await workbook.xlsx.writeFile(filePath);
  
  return { filePath, fileName };
}

// POST /api/elt-registration/submit
router.post('/submit', async (req, res) => {
  try {
    const formData = req.body;

    // Валидация обязательных полей
    if (!formData.registrationType) {
      return res.status(400).json({ error: 'Выберите основание для регистрации' });
    }

    if (!formData.eltCode || formData.eltCode.some((char) => !char)) {
      return res.status(400).json({ error: 'Заполните 15-значный код ELT' });
    }

    // Создаем Excel файл
    const { filePath, fileName } = await createELTExcelFile(formData);

    // Отправляем email с вложением
    const emailResult = await emailService.sendELTRegistrationEmail(formData, filePath, fileName);

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
    console.error('Ошибка при обработке заявления ELT:', error);
    res.status(500).json({ 
      error: 'Ошибка при обработке заявления',
      details: error.message 
    });
  }
});

module.exports = router;

