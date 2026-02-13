const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    initializeTransporter() {
        // Настройка SMTP транспорта
        const smtpHost = process.env.SMTP_HOST;
        const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
        const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
        
        // Если указан SMTP_HOST, используем SMTP_USER/SMTP_PASS (для тестовых сервисов типа Ethereal)
        // Иначе используем EMAIL_USER/EMAIL_PASS (для продакшена, например Gmail)
        let emailUser, emailPass;
        
        if (smtpHost) {
            // Для кастомного SMTP используем SMTP_USER/SMTP_PASS, если они указаны
            // Иначе fallback на EMAIL_USER/EMAIL_PASS
            emailUser = process.env.SMTP_USER || process.env.EMAIL_USER || 'your-email@gmail.com';
            emailPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || 'your-app-password';
        } else {
            // Для Gmail используем EMAIL_USER/EMAIL_PASS, если они указаны
            // Иначе fallback на SMTP_USER/SMTP_PASS для обратной совместимости
            emailUser = process.env.EMAIL_USER || process.env.SMTP_USER || 'your-email@gmail.com';
            emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS || 'your-app-password';
        }
        
        console.log('=== Email Service Configuration ===');
        console.log('Email User:', emailUser ? `${emailUser.substring(0, 3)}***` : 'NOT SET');
        console.log('Email Pass:', emailPass ? '***SET***' : 'NOT SET');
        
        if (emailUser === 'your-email@gmail.com' || emailPass === 'your-app-password') {
            console.warn('⚠️ WARNING: Email credentials are using default values!');
            console.warn('⚠️ Please set EMAIL_USER and EMAIL_PASS (or SMTP_USER and SMTP_PASS) in your .env file');
        }
        
        // Если указан SMTP_HOST, используем универсальную конфигурацию SMTP
        // Иначе используем service: 'gmail' для автоматической настройки Gmail
        if (smtpHost) {
            console.log(`SMTP Host: ${smtpHost}`);
            console.log(`SMTP Port: ${smtpPort}`);
            console.log(`SMTP Secure: ${smtpSecure}`);
            
            this.transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpSecure, // true для 465, false для других портов
                auth: {
                    user: emailUser,
                    pass: emailPass
                },
                tls: {
                    // Не отклонять недействительные сертификаты (для тестовых серверов)
                    rejectUnauthorized: false
                }
            });
        } else {
            // Автоматическая настройка для Gmail
            console.log('Service: Gmail (auto-configured)');
            
            // Проверяем, что это Gmail адрес
            if (emailUser.includes('@gmail.com')) {
                this.transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: emailUser,
                        pass: emailPass
                    }
                });
            } else {
                // Если не Gmail, но SMTP_HOST не указан, используем Gmail настройки по умолчанию
                console.warn('⚠️ WARNING: Non-Gmail address detected but SMTP_HOST not set. Using Gmail settings.');
                this.transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: emailUser,
                        pass: emailPass
                    }
                });
            }
        }

        // Проверка подключения
        this.transporter.verify((error, success) => {
            if (error) {
                console.error('❌ Email service connection error:', error.message);
                console.error('   Error code:', error.code);
                console.error('   Error command:', error.command);
                if (error.response) {
                    console.error('   SMTP response:', error.response);
                }
                console.error('   Please check your EMAIL_USER, EMAIL_PASS, and SMTP settings in .env file');
            } else {
                console.log('✅ Email service ready and verified');
            }
        });
    }

    /**
     * Получить адрес отправителя (from email)
     * Использует ту же логику, что и initializeTransporter
     */
    getFromEmail() {
        const smtpHost = process.env.SMTP_HOST;
        if (smtpHost) {
            // Для кастомного SMTP используем SMTP_USER, если указан
            return process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@belaeronavigatsia.by';
        } else {
            // Для Gmail используем EMAIL_USER, если указан
            return process.env.EMAIL_USER || process.env.SMTP_USER || 'noreply@belaeronavigatsia.by';
        }
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
            // Проверяем, что transporter инициализирован
            if (!this.transporter) {
                console.error(' Email transporter is not initialized!');
                return { success: false, error: 'Email transporter is not initialized' };
            }

            const { fullName, email, notes } = bookingData;
            const { date, startTime, endTime } = slotData;
            const { name, position, phone, offices } = managerData;

            // Проверяем обязательные данные
            if (!email || !fullName) {
                console.error(' Missing required data for email:', { email: !!email, fullName: !!fullName });
                return { success: false, error: 'Missing required data: email and fullName are required' };
            }

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
                        
                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                            <h4 style="margin-top: 0; color: #856404;">Отмена записи:</h4>
                            <p style="margin-bottom: 0; color: #856404;">
                                <strong>Если вам необходимо отменить запись, пожалуйста, свяжитесь с нами по телефону:</strong><br>
                                <span style="font-size: 18px; font-weight: bold; color: #213659;">+375 29 888-88-88</span>
                            </p>
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

ОТМЕНА ЗАПИСИ:
Если вам необходимо отменить запись, пожалуйста, свяжитесь с нами по телефону: +375 29 888-88-88

Пожалуйста, приходите вовремя. При возникновении непредвиденных обстоятельств, просим заранее уведомить об отмене или переносе встречи.

С уважением,
Государственное предприятие «Белаэронавигация»

Это письмо отправлено автоматически, пожалуйста, не отвечайте на него.
            `;

            // Используем правильный адрес отправителя в зависимости от конфигурации
            const fromEmail = this.getFromEmail();
            
            const mailOptions = {
                from: `"ГП «Белаэронавигация»" <${fromEmail}>`,
                to: email,
                subject: 'Подтверждение записи на прием - ГП «Белаэронавигация»',
                text: textContent,
                html: htmlContent
            };

            console.log('=== Sending Booking Confirmation Email ===');
            console.log('To:', email);
            console.log('From:', fromEmail);
            console.log('Subject:', mailOptions.subject);
            
            const result = await this.transporter.sendMail(mailOptions);
            console.log(' Email sent successfully!');
            console.log('Message ID:', result.messageId);
            console.log('Response:', result.response);
            return { success: true, messageId: result.messageId };

        } catch (error) {
            console.error(' Email sending error:', error);
            console.error('Error message:', error.message);
            console.error('Error code:', error.code);
            if (error.response) {
                console.error('SMTP response:', error.response);
            }
            if (error.responseCode) {
                console.error('Response code:', error.responseCode);
            }
            return { success: false, error: error.message, details: error.response || error.code };
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

            // Используем EMAIL_USER для адреса администратора, чтобы избежать ошибок с несуществующими доменами
            const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || process.env.SMTP_USER;
            const fromEmail = process.env.EMAIL_USER || process.env.SMTP_USER || 'noreply@belaeronavigatsia.by';
            
            if (!adminEmail) {
                console.warn('⚠️ ADMIN_EMAIL not set, skipping admin notification');
                return { success: false, error: 'Admin email not configured' };
            }
            
            console.log('=== Sending Admin Notification ===');
            console.log('To:', adminEmail);
            console.log('From:', fromEmail);
            
            const mailOptions = {
                from: `"ГП «Белаэронавигация»" <${fromEmail}>`,
                to: adminEmail,
                subject: `Новая запись на прием - ${fullName}`,
                html: htmlContent
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log(' Admin notification sent successfully!');
            console.log('Message ID:', result.messageId);
            console.log('Response:', result.response);
            return { success: true, messageId: result.messageId };

        } catch (error) {
            console.error(' Admin notification error:', error);
            console.error('Error message:', error.message);
            console.error('Error code:', error.code);
            if (error.response) {
                console.error('SMTP response:', error.response);
            }
            return { success: false, error: error.message, details: error.response || error.code };
        }
    }

    // Уведомление о новой заявке на услугу (администратору)
    async sendServiceRequestNotification(serviceRequest) {
        try {
            // Используем EMAIL_USER для адреса администратора, чтобы избежать ошибок с несуществующими доменами
            const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || process.env.SMTP_USER;
            const fromEmail = process.env.EMAIL_USER || process.env.SMTP_USER || 'noreply@belaeronavigatsia.by';
            
            if (!adminEmail) {
                console.warn('⚠️ ADMIN_EMAIL not set, skipping admin notification');
                return { success: false, error: 'Admin email not configured' };
            }
            
            console.log('=== Sending Service Request Admin Notification ===');
            console.log('To:', adminEmail);
            console.log('From:', fromEmail);
            
            const mailOptions = {
                from: `"ГП «Белаэронавигация»" <${fromEmail}>`,
                to: adminEmail,
                subject: `Новая заявка на услугу #${serviceRequest.id}`,
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <div style="background-color: #213659; padding: 20px; text-align: center;">
                            <h1 style="color: #ffffff;">Новая заявка на услугу</h1>
                        </div>
                        <div style="padding: 20px; border: 1px solid #eee; border-top: none;">
                            <h2 style="color: #213659;">Детали заявки #${serviceRequest.id}</h2>
                            
                            <h3>Контактная информация:</h3>
                            <ul>
                                <li><strong>ФИО:</strong> ${serviceRequest.fullName}</li>
                                <li><strong>Email:</strong> ${serviceRequest.email}</li>
                                ${serviceRequest.phone ? `<li><strong>Телефон:</strong> ${serviceRequest.phone}</li>` : ''}
                                ${serviceRequest.organization ? `<li><strong>Организация:</strong> ${serviceRequest.organization}</li>` : ''}
                                ${serviceRequest.position ? `<li><strong>Должность:</strong> ${serviceRequest.position}</li>` : ''}
                            </ul>
                            
                            <h3>Информация о заявке:</h3>
                            <ul>
                                <li><strong>Тип услуги:</strong> ${serviceRequest.serviceType}</li>
                                <li><strong>Название услуги:</strong> ${serviceRequest.serviceName}</li>
                                <li><strong>Тема:</strong> ${serviceRequest.subject}</li>
                                <li><strong>Приоритет:</strong> ${serviceRequest.priority}</li>
                                <li><strong>Статус:</strong> ${serviceRequest.status}</li>
                                ${serviceRequest.preferredDate ? `<li><strong>Предпочтительная дата:</strong> ${new Date(serviceRequest.preferredDate).toLocaleDateString('ru-RU')}</li>` : ''}
                                ${serviceRequest.budget ? `<li><strong>Бюджет:</strong> ${serviceRequest.budget}</li>` : ''}
                            </ul>
                            
                            <h3>Описание:</h3>
                            <p style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #213659;">
                                ${serviceRequest.description}
                            </p>
                            
                            ${serviceRequest.notes ? `
                            <h3>Дополнительные заметки:</h3>
                            <p style="background-color: #f0f8ff; padding: 15px; border-left: 4px solid #007bff;">
                                ${serviceRequest.notes}
                            </p>
                            ` : ''}
                            
                            <p><strong>Дата создания:</strong> ${new Date(serviceRequest.createdAt).toLocaleString('ru-RU')}</p>
                            
                            <div style="margin-top: 20px; padding: 15px; background-color: #e8f4fd; border-radius: 5px;">
                                <p><strong>Действие:</strong> Пожалуйста, обработайте заявку в административной панели.</p>
                            </div>
                        </div>
                        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 0.8em; color: #666;">
                            <p>Это автоматическое сообщение от системы управления заявками.</p>
                        </div>
                    </div>
                `,
            };
            
            const result = await this.transporter.sendMail(mailOptions);
            console.log(' Service request notification sent successfully!');
            console.log('Message ID:', result.messageId);
            console.log('Response:', result.response);
            return { success: true, messageId: result.messageId };
            
        } catch (error) {
            console.error(' Service request notification error:', error);
            console.error('Error message:', error.message);
            console.error('Error code:', error.code);
            if (error.response) {
                console.error('SMTP response:', error.response);
            }
            return { success: false, error: error.message, details: error.response || error.code };
        }
    }

    // Подтверждение заявки заявителю
    async sendServiceRequestConfirmation(serviceRequest) {
        try {
            // Проверяем, что transporter инициализирован
            if (!this.transporter) {
                console.error(' Email transporter is not initialized!');
                return { success: false, error: 'Email transporter is not initialized' };
            }

            // Проверяем обязательные данные
            if (!serviceRequest.email || !serviceRequest.fullName) {
                console.error(' Missing required data for email:', { 
                    email: !!serviceRequest.email, 
                    fullName: !!serviceRequest.fullName 
                });
                return { success: false, error: 'Missing required data: email and fullName are required' };
            }

            // Используем правильный адрес отправителя в зависимости от конфигурации
            const fromEmail = this.getFromEmail();
            
            console.log('=== Sending Service Request Confirmation Email ===');
            console.log('To:', serviceRequest.email);
            console.log('From:', fromEmail);
            console.log('Subject: Подтверждение заявки #' + serviceRequest.id);
            
            const mailOptions = {
                from: `"ГП «Белаэронавигация»" <${fromEmail}>`,
                to: serviceRequest.email,
                subject: `Подтверждение заявки #${serviceRequest.id}`,
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <div style="background-color: #213659; padding: 20px; text-align: center;">
                            <h1 style="color: #ffffff;">Подтверждение заявки</h1>
                        </div>
                        <div style="padding: 20px; border: 1px solid #eee; border-top: none;">
                            <p>Уважаемый(ая) <strong>${serviceRequest.fullName}</strong>,</p>
                            <p>Ваша заявка на услугу успешно принята и зарегистрирована под номером <strong>#${serviceRequest.id}</strong>.</p>
                            
                            <h2 style="color: #213659;">Детали заявки:</h2>
                            <ul>
                                <li><strong>Тема:</strong> ${serviceRequest.subject}</li>
                                <li><strong>Услуга:</strong> ${serviceRequest.serviceName}</li>
                                <li><strong>Статус:</strong> В обработке</li>
                                <li><strong>Дата подачи:</strong> ${new Date(serviceRequest.createdAt).toLocaleString('ru-RU')}</li>
                            </ul>
                            
                            <h3>Описание заявки:</h3>
                            <p style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #213659;">
                                ${serviceRequest.description}
                            </p>
                            
                            <div style="margin-top: 20px; padding: 15px; background-color: #e8f5e8; border-radius: 5px;">
                                <p><strong>Что дальше?</strong></p>
                                <ul>
                                    <li>Наша команда рассмотрит вашу заявку в течение 1-2 рабочих дней</li>
                                    <li>Мы свяжемся с вами по указанному email или телефону</li>
                                    <li>При необходимости мы можем запросить дополнительную информацию</li>
                                </ul>
                            </div>
                            
                            <p>Если у вас есть вопросы, пожалуйста, свяжитесь с нами:</p>
                            <ul>
                                <li><strong>Телефон:</strong> +375 17 215-40-52</li>
                                <li><strong>Email:</strong> info@belaeronavigatsia.by</li>
                            </ul>
                            
                            <p>С уважением,<br>Команда ГП «Белаэронавигация»</p>
                        </div>
                        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 0.8em; color: #666;">
                            <p>Это автоматическое сообщение, пожалуйста, не отвечайте на него.</p>
                        </div>
                    </div>
                `,
            };
            
            const result = await this.transporter.sendMail(mailOptions);
            console.log(' Service request confirmation sent successfully!');
            console.log('Message ID:', result.messageId);
            console.log('Response:', result.response);
            return { success: true, messageId: result.messageId };
            
        } catch (error) {
            console.error(' Service request confirmation error:', error);
            console.error('Error message:', error.message);
            console.error('Error code:', error.code);
            if (error.response) {
                console.error('SMTP response:', error.response);
            }
            if (error.responseCode) {
                console.error('Response code:', error.responseCode);
            }
            return { success: false, error: error.message, details: error.response || error.code };
        }
    }

    /**
     * Отправка заявления о регистрации ELT с вложением Excel файла
     * @param {Object} formData - Данные формы
     * @param {string} filePath - Путь к Excel файлу
     * @param {string} fileName - Имя файла
     */
    async sendELTRegistrationEmail(formData, filePath, fileName) {
        try {
            // Проверяем, что transporter инициализирован
            if (!this.transporter) {
                console.error(' Email transporter is not initialized!');
                return { success: false, error: 'Email transporter is not initialized' };
            }

            const fs = require('fs');
            const path = require('path');

            // Используем EMAIL_USER для адреса получателя
            const recipientEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || process.env.SMTP_USER;
            const fromEmail = process.env.EMAIL_USER || process.env.SMTP_USER || 'noreply@belaeronavigatsia.by';
            
            if (!recipientEmail) {
                console.warn('⚠️ ADMIN_EMAIL not set, using EMAIL_USER');
                return { success: false, error: 'Admin email not configured' };
            }

            // Читаем файл
            const fileContent = fs.readFileSync(filePath);

            const htmlContent = `
                <!DOCTYPE html>
                <html lang="ru">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Заявление о регистрации ELT</title>
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
                        .section {
                            background-color: white;
                            padding: 15px;
                            border-radius: 8px;
                            margin: 15px 0;
                            border-left: 4px solid #213659;
                        }
                        .section-title {
                            font-weight: bold;
                            color: #213659;
                            margin-bottom: 10px;
                        }
                        .info-row {
                            margin: 8px 0;
                        }
                        .info-label {
                            font-weight: bold;
                            display: inline-block;
                            min-width: 200px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Заявление о регистрации ELT</h1>
                        <p>Государственное предприятие «Белаэронавигация»</p>
                    </div>
                    
                    <div class="content">
                        <p>Поступило новое заявление о регистрации ELT.</p>
                        
                        <div class="section">
                            <div class="section-title">ОСНОВАНИЕ ДЛЯ РЕГИСТРАЦИИ ELT</div>
                            <div class="info-row">
                                <span class="info-label">Тип:</span>
                                <span>${formData.registrationType === 'registration' ? 'регистрация ELT' : 'перерегистрация ELT'}</span>
                            </div>
                        </div>

                        <div class="section">
                            <div class="section-title">ИНФОРМАЦИЯ ПО ELT</div>
                            <div class="info-row">
                                <span class="info-label">15-значный код:</span>
                                <span>${formData.eltCode.join('')}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Модель:</span>
                                <span>${formData.eltModel}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Заводской номер:</span>
                                <span>${formData.eltSerialNumber}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Изготовитель:</span>
                                <span>${formData.eltManufacturer}</span>
                            </div>
                        </div>

                        <div class="section">
                            <div class="section-title">ИНФОРМАЦИЯ О ВОЗДУШНОМ СУДНЕ</div>
                            <div class="info-row">
                                <span class="info-label">Тип:</span>
                                <span>${formData.aircraftType}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Модель:</span>
                                <span>${formData.aircraftModel}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Регистрационный знак:</span>
                                <span>${formData.aircraftRegistration}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Максимальное число людей на борту:</span>
                                <span>${formData.maxPeopleOnBoard}</span>
                            </div>
                        </div>

                        <div class="section">
                            <div class="section-title">ИНФОРМАЦИЯ ОБ ЭКСПЛУАТАНТЕ</div>
                            <div class="info-row">
                                <span class="info-label">Эксплуатант:</span>
                                <span>${formData.operator}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Почтовый адрес:</span>
                                <span>${formData.operatorAddress.filter(addr => addr).join(', ')}</span>
                            </div>
                        </div>

                        <div class="section">
                            <div class="section-title">РЕКВИЗИТЫ ДЛЯ ВЫСТАВЛЕНИЯ СЧЁТА</div>
                            <div class="info-row">
                                <span class="info-label">Полное название:</span>
                                <span>${formData.billingFullName}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Сокращенное название:</span>
                                <span>${formData.billingShortName}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Юридический адрес:</span>
                                <span>${formData.billingLegalAddress}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Почтовый адрес:</span>
                                <span>${formData.billingMailingAddress}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">УНП:</span>
                                <span>${formData.billingUNP}</span>
                            </div>
                        </div>

                        <div class="section">
                            <div class="info-row">
                                <span class="info-label">Дата:</span>
                                <span>${formData.date}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Подпись:</span>
                                <span>${formData.signature}</span>
                            </div>
                        </div>

                        <p style="margin-top: 20px; padding: 15px; background-color: #e8f4fd; border-radius: 5px;">
                            <strong>Примечание:</strong> Подробная информация содержится в прикрепленном Excel файле.
                        </p>
                    </div>
                    
                    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 0.8em; color: #666; margin-top: 20px;">
                        <p>Это автоматическое сообщение от системы управления заявлениями.</p>
                    </div>
                </body>
                </html>
            `;

            console.log('=== Sending ELT Registration Email ===');
            console.log('To:', recipientEmail);
            console.log('From:', fromEmail);
            console.log('Subject: Заявление о регистрации ELT');
            console.log('Attachment:', fileName);

            const mailOptions = {
                from: `"ГП «Белаэронавигация»" <${fromEmail}>`,
                to: recipientEmail,
                subject: 'Заявление о регистрации ELT',
                html: htmlContent,
                attachments: [
                    {
                        filename: fileName,
                        content: fileContent
                    }
                ]
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log(' ELT registration email sent successfully!');
            console.log('Message ID:', result.messageId);
            console.log('Response:', result.response);
            return { success: true, messageId: result.messageId };

        } catch (error) {
            console.error(' ELT registration email error:', error);
            console.error('Error message:', error.message);
            console.error('Error code:', error.code);
            if (error.response) {
                console.error('SMTP response:', error.response);
            }
            return { success: false, error: error.message, details: error.response || error.code };
        }
    }

    /**
     * Отправка заявления о снятии с регистрации ELT с вложением Excel файла
     * @param {Object} formData - Данные формы
     * @param {string} filePath - Путь к Excel файлу
     * @param {string} fileName - Имя файла
     */
    async sendELTDeregistrationEmail(formData, filePath, fileName) {
        try {
            // Проверяем, что transporter инициализирован
            if (!this.transporter) {
                console.error(' Email transporter is not initialized!');
                return { success: false, error: 'Email transporter is not initialized' };
            }

            const fs = require('fs');
            const path = require('path');

            // Используем EMAIL_USER для адреса получателя
            const recipientEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || process.env.SMTP_USER;
            const fromEmail = process.env.EMAIL_USER || process.env.SMTP_USER || 'noreply@belaeronavigatsia.by';
            
            if (!recipientEmail) {
                console.warn('⚠️ ADMIN_EMAIL not set, using EMAIL_USER');
                return { success: false, error: 'Admin email not configured' };
            }

            // Читаем файл
            const fileContent = fs.readFileSync(filePath);

            const htmlContent = `
                <!DOCTYPE html>
                <html lang="ru">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Заявление о снятии с регистрации ELT</title>
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
                        .section {
                            background-color: white;
                            padding: 15px;
                            border-radius: 8px;
                            margin: 15px 0;
                            border-left: 4px solid #213659;
                        }
                        .section-title {
                            font-weight: bold;
                            color: #213659;
                            margin-bottom: 10px;
                        }
                        .info-row {
                            margin: 8px 0;
                        }
                        .info-label {
                            font-weight: bold;
                            display: inline-block;
                            min-width: 200px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Заявление о снятии с регистрации ELT</h1>
                        <p>Государственное предприятие «Белаэронавигация»</p>
                    </div>
                    
                    <div class="content">
                        <p>Поступило новое заявление о снятии с регистрации ELT.</p>
                        
                        <div class="section">
                            <div class="section-title">ИНФОРМАЦИЯ ПО ELT</div>
                            <div class="info-row">
                                <span class="info-label">15-значный код:</span>
                                <span>${formData.eltCode.join('')}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Модель:</span>
                                <span>${formData.eltModel}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Заводской номер:</span>
                                <span>${formData.eltSerialNumber}</span>
                            </div>
                        </div>

                        <div class="section">
                            <div class="section-title">ИНФОРМАЦИЯ О ВОЗДУШНОМ СУДНЕ</div>
                            <div class="info-row">
                                <span class="info-label">Тип:</span>
                                <span>${formData.aircraftType}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Модель:</span>
                                <span>${formData.aircraftModel}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Регистрационный знак:</span>
                                <span>${formData.aircraftRegistration}</span>
                            </div>
                        </div>

                        <div class="section">
                            <div class="section-title">ИНФОРМАЦИЯ ОБ ЭКСПЛУАТАНТЕ</div>
                            <div class="info-row">
                                <span class="info-label">Эксплуатант:</span>
                                <span>${formData.operator}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Почтовый адрес:</span>
                                <span>${formData.operatorAddress}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Рабочий телефон:</span>
                                <span>${formData.operatorWorkPhone}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Мобильный телефон:</span>
                                <span>${formData.operatorMobilePhone}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">E-mail:</span>
                                <span>${formData.operatorEmail}</span>
                            </div>
                        </div>

                        <div class="section">
                            <div class="section-title">ДАННЫЕ ОТВЕТСТВЕННОГО ЗА СНЯТИЕ С РЕГИСТРАЦИИ</div>
                            <div class="info-row">
                                <span class="info-label">Ответственное лицо:</span>
                                <span>${formData.responsiblePerson}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Телефон:</span>
                                <span>${formData.responsiblePhone}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">E-mail:</span>
                                <span>${formData.responsibleEmail}</span>
                            </div>
                        </div>

                        <div class="section">
                            <div class="section-title">РЕКВИЗИТЫ ДЛЯ ВЫСТАВЛЕНИЯ СЧЁТА</div>
                            <div class="info-row">
                                <span class="info-label">Полное название:</span>
                                <span>${formData.billingFullName}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Сокращенное название:</span>
                                <span>${formData.billingShortName}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Юридический адрес:</span>
                                <span>${formData.billingLegalAddress}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Почтовый адрес:</span>
                                <span>${formData.billingMailingAddress}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">УНП:</span>
                                <span>${formData.billingUNP}</span>
                            </div>
                        </div>

                        <div class="section">
                            <div class="info-row">
                                <span class="info-label">Дата:</span>
                                <span>${formData.date}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Подпись:</span>
                                <span>${formData.signature}</span>
                            </div>
                        </div>

                        <p style="margin-top: 20px; padding: 15px; background-color: #e8f4fd; border-radius: 5px;">
                            <strong>Примечание:</strong> Подробная информация содержится в прикрепленном Excel файле.
                        </p>
                    </div>
                    
                    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 0.8em; color: #666; margin-top: 20px;">
                        <p>Это автоматическое сообщение от системы управления заявлениями.</p>
                    </div>
                </body>
                </html>
            `;

            console.log('=== Sending ELT Deregistration Email ===');
            console.log('To:', recipientEmail);
            console.log('From:', fromEmail);
            console.log('Subject: Заявление о снятии с регистрации ELT');
            console.log('Attachment:', fileName);

            const mailOptions = {
                from: `"ГП «Белаэронавигация»" <${fromEmail}>`,
                to: recipientEmail,
                subject: 'Заявление о снятии с регистрации ELT',
                html: htmlContent,
                attachments: [
                    {
                        filename: fileName,
                        content: fileContent
                    }
                ]
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log(' ELT deregistration email sent successfully!');
            console.log('Message ID:', result.messageId);
            console.log('Response:', result.response);
            return { success: true, messageId: result.messageId };

        } catch (error) {
            console.error(' ELT deregistration email error:', error);
            console.error('Error message:', error.message);
            console.error('Error code:', error.code);
            if (error.response) {
                console.error('SMTP response:', error.response);
            }
            return { success: false, error: error.message, details: error.response || error.code };
        }
    }
}

module.exports = new EmailService();
