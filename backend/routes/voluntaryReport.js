const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Настройка Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// POST /api/voluntary-report/send
router.post('/send', async (req, res) => {
  try {
    const {
      fullName,
      organization,
      eventDate,
      eventTime,
      eventLocation,
      eventDescription,
      compilationDate,
      compilationTime,
      recurrenceProbability,
      consequences
    } = req.body;

    // Валидация обязательных полей
    if (!eventDate || !eventTime || !eventLocation || !eventDescription || 
        !compilationDate || !compilationTime || !recurrenceProbability || !consequences) {
      return res.status(400).json({ 
        success: false, 
        message: 'Все обязательные поля должны быть заполнены' 
      });
    }

    // Формирование HTML письма
    const htmlContent = `
      <h2>Добровольное сообщение о небезопасном событии</h2>
      
      <h3>Информация о составителе:</h3>
      <p><strong>Ф.И.О.:</strong> ${fullName || 'Не указано'}</p>
      <p><strong>Организация/должность, контактные данные:</strong> ${organization || 'Не указано'}</p>
      
      <h3>Информация о событии:</h3>
      <p><strong>Дата события:</strong> ${eventDate}</p>
      <p><strong>Время события:</strong> ${eventTime}</p>
      <p><strong>Место события:</strong> ${eventLocation}</p>
      <p><strong>Описание события:</strong></p>
      <p>${eventDescription.replace(/\n/g, '<br>')}</p>
      
      <h3>Дополнительная информация:</h3>
      <p><strong>Дата составления информации о событии:</strong> ${compilationDate}</p>
      <p><strong>Время составления информации о событии:</strong> ${compilationTime}</p>
      <p><strong>Вероятность повторения подобного события:</strong> ${recurrenceProbability}</p>
      <p><strong>Каковы будут последствия события, если оно повторится:</strong> ${consequences}</p>
      
      <hr>
      <p><em>Сообщение отправлено через веб-форму добровольного сообщения о небезопасном событии</em></p>
    `;

    // Настройка письма
    const mailOptions = {
      from: process.env.EMAIL_USER || 'kovaleva7855@gmail.com',
      to: 'kovaleva7855@gmail.com',
      subject: 'Добровольное сообщение о небезопасном событии',
      html: htmlContent
    };

    // Отправка письма
    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: 'Сообщение успешно отправлено' 
    });

  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при отправке сообщения' 
    });
  }
});

module.exports = router;
