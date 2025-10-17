const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    initializeTransporter() {
        // Настройка SMTP транспорта
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false, // true для 465, false для других портов
            auth: {
                user: process.env.SMTP_USER || 'your-email@gmail.com',
                pass: process.env.SMTP_PASS || 'your-app-password'
            }
        });

        // Проверка подключения
        this.transporter.verify((error, success) => {
            if (error) {
                console.log('❌ Email service error:', error);
            } else {
                console.log('✅ Email service ready');
            }
        });
    }

    /**
     * Отправка уведомления о записи на прием
     * @param {Object} bookingData - Данные о бронировании
     * @param {string} bookingData.fullName - ФИО пользователя
     * @param {string} bookingData.email - Email пользователя
     * @param {string} bookingData.notes - Дополнительная информация
     * @param {Object} slotData - Данные о слоте
     * @param {string} slotData.date - Дата приема
     * @param {string} slotData.startTime - Время начала
     * @param {string} slotData.endTime - Время окончания
     * @param {Object} managerData - Данные о руководителе
     * @param {string} managerData.name - Имя руководителя
     * @param {string} managerData.position - Должность руководителя
     * @param {string} managerData.phone - Телефон руководителя
     * @param {string} managerData.offices - Кабинеты
     */
    async sendBookingConfirmation(bookingData, slotData, managerData) {
        try {
            const { fullName, email, notes } = bookingData;
            const { date, startTime, endTime } = slotData;
            const { name, position, phone, offices } = managerData;

            // Форматирование даты и времени
            const appointmentDate = new Date(date).toLocaleDateString('ru-RU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const appointmentTime = new Date(startTime).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const appointmentEndTime = new Date(endTime).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            });

            // HTML шаблон письма
            const htmlContent = `
                <!DOCTYPE html>
                <html lang="ru">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Подтверждение записи на прием</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background-color: #213659;
                            color: white;
                            padding: 20px;
                            text-align: center;
                            border-radius: 8px 8px 0 0;
                        }
                        .content {
                            background-color: #f9f9f9;
                            padding: 30px;
                            border-radius: 0 0 8px 8px;
                        }
                        .appointment-details {
                            background-color: white;
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                            border-left: 4px solid #213659;
                        }
                        .manager-info {
                            background-color: #e8f4fd;
                            padding: 15px;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            color: #666;
                            font-size: 14px;
                        }
                        .highlight {
                            color: #213659;
                            font-weight: bold;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Запись на прием подтверждена</h1>
                        <p>Государственное предприятие «Белаэронавигация»</p>
                    </div>
                    
                    <div class="content">
                        <p>Уважаемый(ая) <span class="highlight">${fullName}</span>!</p>
                        
                        <p>Ваша запись на прием к руководителю успешно подтверждена.</p>
                        
                        <div class="appointment-details">
                            <h3>Детали приема:</h3>
                            <p><strong>Дата:</strong> ${appointmentDate}</p>
                            <p><strong>Время:</strong> ${appointmentTime} - ${appointmentEndTime}</p>
                            <p><strong>Руководитель:</strong> ${name}</p>
                            <p><strong>Должность:</strong> ${position}</p>
                            ${phone ? `<p><strong>Телефон:</strong> ${phone}</p>` : ''}
                            ${offices ? `<p><strong>Кабинеты:</strong> ${offices}</p>` : ''}
                            ${notes ? `<p><strong>Цель визита:</strong> ${notes}</p>` : ''}
                        </div>
                        
                        <div class="manager-info">
                            <h4>Контактная информация:</h4>
                            <p>Если у вас возникли вопросы или необходимо перенести встречу, пожалуйста, свяжитесь с нами заранее.</p>
                        </div>
                        
                        <p>Пожалуйста, приходите вовремя. При возникновении непредвиденных обстоятельств, просим заранее уведомить об отмене или переносе встречи.</p>
                    </div>
                    
                    <div class="footer">
                        <p>С уважением,<br>Государственное предприятие «Белаэронавигация»</p>
                        <p>Это письмо отправлено автоматически, пожалуйста, не отвечайте на него.</p>
                    </div>
                </body>
                </html>
            `;

            // Текстовая версия письма
            const textContent = `
Запись на прием подтверждена
Государственное предприятие «Белаэронавигация»

Уважаемый(ая) ${fullName}!

Ваша запись на прием к руководителю успешно подтверждена.

Детали приема:
- Дата: ${appointmentDate}
- Время: ${appointmentTime} - ${appointmentEndTime}
- Руководитель: ${name}
- Должность: ${position}
${phone ? `- Телефон: ${phone}` : ''}
${offices ? `- Кабинеты: ${offices}` : ''}
${notes ? `- Цель визита: ${notes}` : ''}

Контактная информация:
Если у вас возникли вопросы или необходимо перенести встречу, пожалуйста, свяжитесь с нами заранее.

Пожалуйста, приходите вовремя. При возникновении непредвиденных обстоятельств, просим заранее уведомить об отмене или переносе встречи.

С уважением,
Государственное предприятие «Белаэронавигация»

Это письмо отправлено автоматически, пожалуйста, не отвечайте на него.
            `;

            const mailOptions = {
                from: `"ГП «Белаэронавигация»" <${process.env.SMTP_USER || 'noreply@belaeronavigatsia.by'}>`,
                to: email,
                subject: 'Подтверждение записи на прием - ГП «Белаэронавигация»',
                text: textContent,
                html: htmlContent
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };

        } catch (error) {
            console.error('❌ Email sending error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Отправка уведомления администратору о новой записи
     */
    async sendAdminNotification(bookingData, slotData, managerData) {
        try {
            const { fullName, email, notes } = bookingData;
            const { date, startTime, endTime } = slotData;
            const { name, position } = managerData;

            const appointmentDate = new Date(date).toLocaleDateString('ru-RU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const appointmentTime = new Date(startTime).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const htmlContent = `
                <!DOCTYPE html>
                <html lang="ru">
                <head>
                    <meta charset="UTF-8">
                    <title>Новая запись на прием</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .header { background-color: #213659; color: white; padding: 20px; text-align: center; }
                        .content { padding: 20px; background-color: #f9f9f9; }
                        .appointment-details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #213659; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>Новая запись на прием</h2>
                    </div>
                    <div class="content">
                        <p>Поступила новая запись на прием к руководителю.</p>
                        <div class="appointment-details">
                            <h3>Детали записи:</h3>
                            <p><strong>Клиент:</strong> ${fullName}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Дата приема:</strong> ${appointmentDate}</p>
                            <p><strong>Время:</strong> ${appointmentTime}</p>
                            <p><strong>Руководитель:</strong> ${name} (${position})</p>
                            ${notes ? `<p><strong>Цель визита:</strong> ${notes}</p>` : ''}
                        </div>
                    </div>
                </body>
                </html>
            `;

            const mailOptions = {
                from: `"ГП «Белаэронавигация»" <${process.env.SMTP_USER || 'noreply@belaeronavigatsia.by'}>`,
                to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
                subject: `Новая запись на прием - ${fullName}`,
                html: htmlContent
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Admin notification sent:', result.messageId);
            return { success: true, messageId: result.messageId };

        } catch (error) {
            console.error('❌ Admin notification error:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new EmailService();
