require('dotenv').config();
const { sendVerificationEmail, sendAgentSetupEmail } = require('./utils/emailService');

console.log('Environment variables:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not set');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

async function testEmail() {
  try {
    console.log('Testing verification email service...');
    const result = await sendVerificationEmail(
      'test@example.com',
      'Test User',
      'testpassword123',
      'test-token-123',
      'Test Company'
    );
    console.log('Verification email test result:', result);

    console.log('Testing agent setup email service...');
    const setupResult = await sendAgentSetupEmail(
      'test@example.com',
      'Test User',
      'Test Company'
    );
    console.log('Agent setup email test result:', setupResult);
  } catch (error) {
    console.error('Email test error:', error);
  }
}

testEmail(); 