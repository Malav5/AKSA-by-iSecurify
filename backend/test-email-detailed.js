require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Testing email configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not set');

async function testTransporter() {
    try {
        console.log('Creating transporter...');
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        console.log('Verifying transporter...');
        await transporter.verify();
        console.log('Transporter verified successfully!');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: 'test@example.com',
            subject: 'Test Email from AKSA',
            text: 'This is a test email to verify the configuration.',
        });

        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error details:', error.message);
        console.error('Full error:', error);
        return false;
    }
}

testTransporter(); 