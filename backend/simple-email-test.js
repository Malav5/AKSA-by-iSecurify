require('dotenv').config();

console.log('=== Email Configuration Test ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 'Not set');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

// Test if nodemailer is working
try {
    const nodemailer = require('nodemailer');
    console.log('✅ Nodemailer loaded successfully');

    const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    console.log('✅ Transporter created successfully');

    // Test the connection
    transporter.verify(function (error, success) {
        if (error) {
            console.log('❌ Transporter verification failed:', error.message);
        } else {
            console.log('✅ Transporter verified successfully');
        }
    });

} catch (error) {
    console.log('❌ Error loading nodemailer:', error.message);
} 