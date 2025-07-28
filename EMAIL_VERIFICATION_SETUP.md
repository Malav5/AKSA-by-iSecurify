# Email Verification Setup Guide

This guide will help you set up email verification for the AKSA Platform.

## Prerequisites

1. **Gmail Account**: You'll need a Gmail account to send verification emails
2. **Gmail App Password**: You'll need to generate an app password for your Gmail account

## Step 1: Generate Gmail App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to "Security" → "2-Step Verification" (enable if not already enabled)
3. Go to "App passwords" (under 2-Step Verification)
4. Select "Mail" as the app and "Other" as the device
5. Generate the app password and copy it

## Step 2: Install Dependencies

Navigate to the backend directory and install the required packages:

```bash
cd backend
npm install nodemailer crypto
```

## Step 3: Environment Configuration

Add the following environment variables to your `.env` file in the backend directory:

```env
# Email Configuration
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Frontend URL (for email verification links)
FRONTEND_URL=http://localhost:5173
```

Replace:
- `your_gmail_address@gmail.com` with your actual Gmail address
- `your_gmail_app_password` with the app password you generated in Step 1

## Step 4: Database Migration

The user model has been updated with email verification fields. If you have existing users, you may want to update them:

```javascript
// In MongoDB shell or your database management tool
db.users.updateMany(
  { isEmailVerified: { $exists: false } },
  { $set: { isEmailVerified: false } }
);
```

## Step 5: Test the Setup

1. Start your backend server: `npm start`
2. Start your frontend: `npm run dev`
3. Try registering a new user
4. Check your email for the verification link
5. Click the verification link to complete the registration

## How It Works

### Registration Flow
1. User fills out the signup form
2. System creates user account with `isEmailVerified: false`
3. System generates a verification token and sends email
4. User receives email with verification link
5. User clicks link to verify email
6. System marks email as verified and logs user in

### Login Flow
1. User attempts to login
2. System checks if email is verified
3. If not verified, shows error message
4. If verified, proceeds with normal login

### Email Verification
- Verification tokens expire after 24 hours
- Users can request new verification emails
- Failed email sends result in user account deletion (for security)

## Troubleshooting

### Email Not Sending
- Check your Gmail app password is correct
- Ensure 2-Step Verification is enabled
- Check your Gmail account for any security alerts
- Verify the EMAIL_USER and EMAIL_PASSWORD environment variables

### Verification Link Not Working
- Check the FRONTEND_URL environment variable
- Ensure the frontend is running on the correct port
- Check browser console for any errors

### Database Issues
- Ensure MongoDB is running
- Check your MONGODB_URI environment variable
- Verify the user model has been updated with verification fields

## Security Features

- Verification tokens are cryptographically secure (32 bytes random)
- Tokens expire after 24 hours
- Failed email sends result in account cleanup
- Email verification is required before login
- Resend functionality with rate limiting considerations

## Customization

### Email Template
You can customize the email template in `backend/utils/emailService.js`. The current template includes:
- Professional styling with AKSA branding
- Clear call-to-action button
- Fallback text link
- Expiration information

### Email Provider
To use a different email provider (like SendGrid, Mailgun, etc.), modify the `createTransporter` function in `emailService.js`.

### Token Expiration
To change the token expiration time, modify the `verificationExpires` calculation in the register route.

## Support

If you encounter any issues, check:
1. Backend server logs for error messages
2. Frontend console for JavaScript errors
3. Email delivery status in your Gmail account
4. Database connection and user records 