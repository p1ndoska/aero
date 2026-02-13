require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSMTPConnection() {
    console.log('\n=== SMTP Connection Diagnostic Tool ===\n');
    
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
    const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
    
    // Определяем учетные данные
    let emailUser, emailPass;
    if (smtpHost) {
        emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
        emailPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    } else {
        emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
        emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
    }
    
    console.log('Configuration:');
    console.log('  SMTP Host:', smtpHost || 'smtp.gmail.com (Gmail)');
    console.log('  SMTP Port:', smtpPort);
    console.log('  SMTP Secure:', smtpSecure);
    console.log('  Email User:', emailUser ? `${emailUser.substring(0, 3)}***` : 'NOT SET');
    console.log('  Email Pass:', emailPass ? 'SET' : 'NOT SET');
    console.log('');
    
    if (!emailUser || !emailPass) {
        console.error('❌ ERROR: Email credentials not configured!');
        console.error('   Please set EMAIL_USER/EMAIL_PASS or SMTP_USER/SMTP_PASS in .env file');
        process.exit(1);
    }
    
    // Создаем transporter
    let transporter;
    if (smtpHost) {
        transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: {
                user: emailUser,
                pass: emailPass
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
            tls: {
                rejectUnauthorized: false
            },
            debug: true,
            logger: true
        });
    } else {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
            debug: true,
            logger: true
        });
    }
    
    console.log('Testing SMTP connection...\n');
    
    try {
        // Проверка подключения
        await transporter.verify();
        console.log('✅ SMTP connection successful!');
        console.log('   Server is reachable and credentials are valid\n');
        
        // Тестовая отправка
        const testEmail = process.env.ADMIN_EMAIL || emailUser;
        console.log('Sending test email to:', testEmail);
        
        const result = await transporter.sendMail({
            from: `"Test" <${emailUser}>`,
            to: testEmail,
            subject: 'SMTP Connection Test',
            text: 'This is a test email to verify SMTP connection is working correctly.',
            html: '<p>This is a test email to verify SMTP connection is working correctly.</p>'
        });
        
        console.log('✅ Test email sent successfully!');
        console.log('   Message ID:', result.messageId);
        console.log('   Response:', result.response);
        console.log('\n✅ All tests passed! Email service is working correctly.');
        
    } catch (error) {
        console.error('\n❌ SMTP connection failed!');
        console.error('   Error:', error.message);
        console.error('   Error code:', error.code);
        console.error('   Error name:', error.name);
        
        if (error.response) {
            console.error('   SMTP response:', error.response);
        }
        
        // Детальная диагностика
        if (error.code === 'ETIMEDOUT') {
            console.error('\n⚠️ TIMEOUT ERROR:');
            console.error('   The SMTP server did not respond in time.');
            console.error('   Possible causes:');
            console.error('     - Firewall blocking SMTP port', smtpPort);
            console.error('     - Network connectivity issues');
            console.error('     - SMTP server is down');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('\n⚠️ CONNECTION REFUSED:');
            console.error('   The SMTP server refused the connection.');
            console.error('   Possible causes:');
            console.error('     - Firewall blocking SMTP port', smtpPort);
            console.error('     - Wrong SMTP host/port');
            console.error('     - SMTP server is not running');
        } else if (error.code === 'ENOTFOUND') {
            console.error('\n⚠️ DNS ERROR:');
            console.error('   Cannot resolve SMTP hostname:', smtpHost || 'smtp.gmail.com');
            console.error('   Possible causes:');
            console.error('     - DNS resolution issues');
            console.error('     - Wrong SMTP hostname');
            console.error('     - Network connectivity problems');
        } else if (error.code === 'EHOSTUNREACH') {
            console.error('\n⚠️ HOST UNREACHABLE:');
            console.error('   Cannot reach SMTP server.');
            console.error('   Possible causes:');
            console.error('     - Network routing issues');
            console.error('     - Firewall blocking');
            console.error('     - Server is down');
        } else if (error.code === 'EAUTH') {
            console.error('\n⚠️ AUTHENTICATION ERROR:');
            console.error('   Invalid email credentials.');
            console.error('   Check EMAIL_USER and EMAIL_PASS in .env file');
        }
        
        console.error('\n💡 Troubleshooting tips:');
        console.error('   1. Check firewall settings - ensure port', smtpPort, 'is open');
        console.error('   2. Test network connectivity: ping', smtpHost || 'smtp.gmail.com');
        console.error('   3. Check DNS resolution: nslookup', smtpHost || 'smtp.gmail.com');
        console.error('   4. Verify email credentials are correct');
        console.error('   5. Check if proxy/VPN is interfering');
        
        process.exit(1);
    }
    
    process.exit(0);
}

testSMTPConnection();

