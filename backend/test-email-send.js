require('dotenv').config();
const emailService = require('./utils/emailService');

async function testEmail() {
    console.log('\n=== Testing Email Service ===\n');
    
    // Ждем немного, чтобы transporter успел инициализироваться
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Тест отправки письма
    const testEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'test@example.com';
    
    console.log('Sending test email to:', testEmail);
    console.log('From:', process.env.EMAIL_USER || process.env.SMTP_USER);
    
    try {
        // Используем метод отправки подтверждения заявки для теста
        const result = await emailService.sendServiceRequestConfirmation({
            id: 999,
            email: testEmail,
            fullName: 'Test User',
            subject: 'Test Email',
            serviceName: 'Test Service',
            description: 'This is a test email to verify email service is working correctly.',
            createdAt: new Date()
        });
        
        if (result.success) {
            console.log('\n✅ Test email sent successfully!');
            console.log('Message ID:', result.messageId);
            console.log('\nPlease check your email inbox (and spam folder)');
        } else {
            console.error('\n❌ Failed to send test email');
            console.error('Error:', result.error);
            if (result.details) {
                console.error('Details:', result.details);
            }
        }
    } catch (error) {
        console.error('\n❌ Error during email test:');
        console.error(error.message);
        console.error(error.stack);
    }
    
    // Даем время для завершения асинхронных операций
    setTimeout(() => {
        process.exit(0);
    }, 3000);
}

testEmail();

