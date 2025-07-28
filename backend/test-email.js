require('dotenv').config();
const { sendVerificationEmail } = require('./utils/emailService');

console.log('Environment variables:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not set');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

async function testEmail() {
  try {
    console.log('Testing email service...');
    const result = await sendVerificationEmail(
      'test@example.com',
      'Test User',
      'test-token-123'
    );
    console.log('Email test result:', result);
  } catch (error) {
    console.error('Email test error:', error);
  }
}

testEmail(); 