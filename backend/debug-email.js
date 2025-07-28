require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('=== Email Debug Test ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set (' + process.env.EMAIL_PASSWORD.length + ' chars)' : 'Not set');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

async function debugEmail() {
  try {
    console.log('\n1. Creating transporter...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    console.log('2. Testing transporter verification...');
    await transporter.verify();
    console.log('✅ Transporter verified successfully!');

    console.log('3. Sending test email...');
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'test@example.com',
      subject: 'Test Email from AKSA Platform',
      text: 'This is a test email to verify the email service is working.',
      html: '<h1>Test Email</h1><p>This is a test email from AKSA Platform.</p>'
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
    return true;
  } catch (error) {
    console.log('❌ Error occurred:');
    console.log('Error message:', error.message);
    console.log('Error code:', error.code);
    console.log('Full error:', error);
    
    // Common Gmail errors and solutions
    if (error.code === 'EAUTH') {
      console.log('\n🔧 SOLUTION: This is an authentication error.');
      console.log('Please check:');
      console.log('1. Your Gmail app password is correct');
      console.log('2. 2-Step Verification is enabled');
      console.log('3. The app password hasn\'t expired');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n🔧 SOLUTION: Connection error.');
      console.log('Please check your internet connection.');
    }
    
    return false;
  }
}

debugEmail(); 