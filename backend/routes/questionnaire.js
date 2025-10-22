const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Настройка nodemailer
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true для 465, false для других портов
  auth: {
    user: process.env.EMAIL_USER || 'clvx.fisy.ptue.acon@gmail.com',
    pass: process.env.EMAIL_PASS || 'zbpv psjn uuod vnpv' // пароль приложения Gmail
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Маршрут для отправки анкеты потребителя
router.post('/send-questionnaire', async (req, res) => {
  try {
    console.log('Получен запрос на отправку анкеты:', req.body);
    
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

    console.log('Настройки письма:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    // Отправка письма
    console.log('Отправка письма...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Письмо отправлено:', info.messageId);

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

// Тестовый маршрут для проверки отправки email
router.post('/test-email', async (req, res) => {
  try {
    console.log('Тестирование отправки email...');
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'clvx.fisy.ptue.acon@gmail.com',
      to: process.env.EMAIL_TO || 'kovaleva7855@gmail.com',
      subject: 'Тестовое письмо от анкеты',
      html: '<h1>Тестовое письмо</h1><p>Если вы получили это письмо, значит настройки email работают корректно.</p>'
    };

    console.log('Отправка тестового письма...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Тестовое письмо отправлено:', info.messageId);

    res.json({ 
      success: true, 
      message: 'Тестовое письмо отправлено',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Ошибка отправки тестового письма:', error);
    res.status(500).json({ 
      error: 'Ошибка при отправке тестового письма',
      details: error.message 
    });
  }
});

module.exports = router;
