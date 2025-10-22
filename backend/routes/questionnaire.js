const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Настройка nodemailer
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'clvx.fisy.ptue.acon@gmail.com',
    pass: process.env.EMAIL_PASS || 'kovaleva7854@gmail.com'
  }
});

// Маршрут для отправки анкеты потребителя
router.post('/send-questionnaire', async (req, res) => {
  try {
    const {
      userAddress,
      userName,
      phone,
      email,
      phraseologyQuality,
      informationTimeliness,
      equipmentQuality,
      proceduresQuality,
      satisfactionReasons,
      suggestions,
      completionDate,
      antispamCode
    } = req.body;

    // Валидация обязательных полей
    const requiredFields = ['userAddress', 'phone', 'email', 'phraseologyQuality', 'informationTimeliness', 'equipmentQuality', 'proceduresQuality', 'completionDate'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Заполните все обязательные поля',
        missingFields 
      });
    }

    // Формирование HTML письма
    const htmlContent = `
      <h2>Анкета потребителя аэронавигационных услуг</h2>
      
      <h3>1. Информация о пользователе:</h3>
      <p><strong>Адрес пользователя:</strong> ${userAddress}</p>
      <p><strong>Наименование пользователя:</strong> ${userName || 'Не указано'}</p>
      <p><strong>Телефон:</strong> ${phone}</p>
      <p><strong>E-mail:</strong> ${email}</p>
      
      <h3>2. Удовлетворенность услугами:</h3>
      <p><strong>Качество ведения фразеологии радиообмена:</strong> ${phraseologyQuality}</p>
      <p><strong>Своевременность информирования о воздушной обстановке:</strong> ${informationTimeliness}</p>
      <p><strong>Качество работы радиотехнических средств:</strong> ${equipmentQuality}</p>
      <p><strong>Качество процедур обслуживания воздушного движения:</strong> ${proceduresQuality}</p>
      
      <h3>3. Дополнительная информация:</h3>
      <p><strong>Причины снижения оценки:</strong> ${satisfactionReasons || 'Не указано'}</p>
      <p><strong>Предложения по улучшению:</strong> ${suggestions || 'Не указано'}</p>
      <p><strong>Дата заполнения:</strong> ${completionDate}</p>
      
      <hr>
      <p><em>Анкета отправлена автоматически с сайта Белаэронавигация</em></p>
    `;

    // Настройка письма
    const mailOptions = {
      from: process.env.EMAIL_USER || 'clvx.fisy.ptue.acon@gmail.com',
      to: process.env.EMAIL_TO || 'kovaleva7855@gmail.com',
      subject: 'Анкета потребителя аэронавигационных услуг',
      html: htmlContent,
      replyTo: email // для ответа на email пользователя
    };

    // Отправка письма
    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: 'Анкета успешно отправлена' 
    });

  } catch (error) {
    console.error('Ошибка отправки анкеты:', error);
    res.status(500).json({ 
      error: 'Ошибка при отправке анкеты',
      details: error.message 
    });
  }
});

module.exports = router;
