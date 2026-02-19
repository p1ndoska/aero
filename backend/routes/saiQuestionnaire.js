const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Настройка nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Маршрут для отправки анкеты потребителя САИ
router.post('/submit', async (req, res) => {
  try {
    const {
      overallQuality,
      timeliness,
      airacAccuracy,
      airacAvailability,
      aipAccuracy,
      aipClarity,
      aicAccuracy,
      aicAvailability,
      notamList,
      notamClarity,
      notamCompleteness,
      websiteRating,
      comments,
      organizationName,
      positionAndName,
      completionDate,
      antispamCode
    } = req.body;

    // Валидация обязательных полей
    const requiredFields = [
      'overallQuality',
      'timeliness',
      'airacAccuracy',
      'airacAvailability',
      'aipAccuracy',
      'aipClarity',
      'aicAccuracy',
      'aicAvailability',
      'notamList',
      'notamClarity',
      'notamCompleteness',
      'websiteRating',
      'organizationName',
      'positionAndName',
      'completionDate'
    ];
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Заполните все обязательные поля',
        missingFields 
      });
    }

    // Валидация антиспам кода выполняется в frontend

    // Формируем текст письма
    const ratingLabels = {
      'excellent': 'Отлично',
      'good': 'Хорошо',
      'satisfactory': 'Удовлетворительно',
      'poor': 'Плохо',
      'very-poor': 'Очень плохо'
    };

    const getRatingLabel = (value) => ratingLabels[value] || value;

    const emailText = `
Анкета потребителя САИ Республики Беларусь

1. Как Вы в целом оцениваете качество обеспечения аэронавигационной информацией?
   Ответ: ${getRatingLabel(overallQuality)}

2. Как Вы оцениваете своевременность опубликования аэронавигационной информации?
   Ответ: ${getRatingLabel(timeliness)}

3. Как Вы оцениваете поправки по циклу AIRAC?
   - Точность информации: ${getRatingLabel(airacAccuracy)}
   - Доступность информации: ${getRatingLabel(airacAvailability)}

4. Как Вы оцениваете дополнения к AIP?
   - Точность информации: ${getRatingLabel(aipAccuracy)}
   - Ясность информации: ${getRatingLabel(aipClarity)}

5. Как Вы оцениваете циркуляры аэронавигационной информации?
   - Точность информации: ${getRatingLabel(aicAccuracy)}
   - Доступность информации: ${getRatingLabel(aicAvailability)}

6. Как Вы оцениваете списки действующих НОТАМ?
   Ответ: ${getRatingLabel(notamList)}

7. Как Вы оцениваете информацию, публикуемую НОТАМ?
   - Ясность информации: ${getRatingLabel(notamClarity)}
   - Полнота: ${getRatingLabel(notamCompleteness)}

8. Как Вы оцениваете нашу страницу в сети Internet на сайте: http://www.ban.by?
   Ответ: ${getRatingLabel(websiteRating)}

Ваши комментарии:
${comments || 'Не указано'}

Название организации: ${organizationName}
Должность и ФИО: ${positionAndName}
Дата заполнения: ${completionDate}
`;

    // Отправляем email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Можно настроить отдельный email для анкет
      subject: `Анкета потребителя САИ Республики Беларусь от ${organizationName}`,
      text: emailText
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: 'Анкета успешно отправлена' 
    });

  } catch (error) {
    console.error('Ошибка при отправке анкеты САИ:', error);
    res.status(500).json({ 
      error: 'Ошибка при отправке анкеты',
      details: error.message 
    });
  }
});

module.exports = router;

