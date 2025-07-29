const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create a transporter using Gmail SMTP (you can change this to your preferred email service)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASSWORD, // Your Gmail app password
    },
  });
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
const sendVerificationEmail = async (email, firstName, password, verificationToken, companyName = null) => {
  try {
    const transporter = createTransporter();

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email - AKSA Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">AKSA Platform</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">By iSecurify</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to AKSA, ${firstName}!</h2>
            <p style="color: #333; font-size: 16px; margin-bottom: 10px;">
              <strong>Your Email:</strong> ${email}<br/>
              <strong>Your Password:</strong> ${password}${companyName ? `<br/><strong>Company:</strong> ${companyName}` : ''}
            </p>
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Thank you for signing up for AKSA Platform. To complete your registration and start using our security services, 
              please verify your email address by clicking the button below.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                Verify Email Address
              </a>
            </div>
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="color: #667eea; font-size: 14px; word-break: break-all; background: #f1f3f4; padding: 10px; border-radius: 5px;">
              ${verificationUrl}
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This verification link will expire in 24 hours. If you didn't create an account with AKSA Platform, 
                you can safely ignore this email.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

// Send resend verification email (without password)
const sendResendVerificationEmail = async (email, firstName, verificationToken, companyName = null) => {
  try {
    const transporter = createTransporter();

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email - AKSA Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">AKSA Platform</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">By iSecurify</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Email Verification Required</h2>
            <p style="color: #333; font-size: 16px; margin-bottom: 10px;">
              <strong>Your Email:</strong> ${email}${companyName ? `<br/><strong>Company:</strong> ${companyName}` : ''}
            </p>
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Hello ${firstName}, you requested a new verification email for your AKSA Platform account. 
              Please verify your email address by clicking the button below to complete your registration.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                Verify Email Address
              </a>
            </div>
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="color: #667eea; font-size: 14px; word-break: break-all; background: #f1f3f4; padding: 10px; border-radius: 5px;">
              ${verificationUrl}
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This verification link will expire in 24 hours. If you didn't request this verification email, 
                you can safely ignore this message.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Resend verification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending resend verification email:', error);
    return false;
  }
};

// Send agent setup instructions email
const sendAgentSetupEmail = async (email, firstName, companyName = null) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to AKSA Platform - Agent Setup Instructions',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">AKSA Platform</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">By iSecurify</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to AKSA, ${firstName}!</h2>
            <p style="color: #333; font-size: 16px; margin-bottom: 10px;">
              <strong>Your Email:</strong> ${email}${companyName ? `<br/><strong>Company:</strong> ${companyName}` : ''}
            </p>
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Congratulations! Your email has been successfully verified. Your AKSA Platform account is now active and ready to use.
            </p>
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #2c5aa0; margin-top: 0; margin-bottom: 15px;">🚀 Next Steps: Setting Up Your Agent</h3>
              <p style="color: #2c5aa0; margin-bottom: 15px; font-weight: bold;">
                To start monitoring your devices and receiving security alerts, you need to install the AKSA agent on your devices.
              </p>
            </div>

            <h3 style="color: #333; margin-bottom: 15px;">📋 Agent Setup Instructions:</h3>
            
            <div style="background: #fff; border-left: 4px solid #667eea; padding: 15px; margin: 15px 0;">
              <h4 style="color: #333; margin-top: 0; margin-bottom: 10px;">Step 1: Access Your Dashboard</h4>
              <p style="color: #666; margin-bottom: 0;">
                Log in to your AKSA Platform dashboard using your verified email and password.
              </p>
            </div>

            <div style="background: #fff; border-left: 4px solid #667eea; padding: 15px; margin: 15px 0;">
              <h4 style="color: #333; margin-top: 0; margin-bottom: 10px;">Step 2: Navigate to Agent Management</h4>
              <p style="color: #666; margin-bottom: 0;">
                Go to the "SOC Dashboard" section and click on "Add Agent" to open the deployment modal.
              </p>
            </div>

            <div style="background: #fff; border-left: 4px solid #667eea; padding: 15px; margin: 15px 0;">
              <h4 style="color: #333; margin-top: 0; margin-bottom: 10px;">Step 3: Select Your Device Type</h4>
              <p style="color: #666; margin-bottom: 0;">
                Choose your operating system and package type from the available options.
              </p>
            </div>

            <div style="background: #fff; border-left: 4px solid #667eea; padding: 15px; margin: 15px 0;">
              <h4 style="color: #333; margin-top: 0; margin-bottom: 10px;">Step 4: Install the Agent</h4>
              <p style="color: #666; margin-bottom: 0;">
                Copy and run the provided installation command for your device type.
              </p>
            </div>

            <div style="background: #fff; border-left: 4px solid #667eea; padding: 15px; margin: 15px 0;">
              <h4 style="color: #333; margin-top: 0; margin-bottom: 10px;">Step 5: Start the Agent</h4>
              <p style="color: #666; margin-bottom: 0;">
                Run the start command to activate the agent on your device.
              </p>
            </div>

            <h3 style="color: #333; margin-bottom: 15px;">🖥️ Device-Specific Commands:</h3>
            
            <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h4 style="color: #333; margin-top: 0; margin-bottom: 15px;">🐧 Linux (RPM - amd64):</h4>
              <div style="background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 14px; margin-bottom: 10px; overflow-x: auto;">
                curl -O https://packages.wazuh.com/4.x/yum/wazuh-agent-4.12.0-1.x86_64.rpm && sudo rpm -ivh wazuh-agent-4.12.0-1.x86_64.rpm && sudo WAZUH_MANAGER='192.168.1.198' /var/ossec/bin/agent-auth -m 192.168.1.198
              </div>
              <div style="background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 14px; overflow-x: auto;">
                sudo systemctl start wazuh-agent
              </div>
            </div>

            <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h4 style="color: #333; margin-top: 0; margin-bottom: 15px;">🐧 Linux (DEB - amd64):</h4>
              <div style="background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 14px; margin-bottom: 10px; overflow-x: auto;">
                curl -O https://packages.wazuh.com/4.x/apt/pool/main/w/wazuh-agent_4.12.0-1_amd64.deb && sudo dpkg -i wazuh-agent_4.12.0-1_amd64.deb && sudo WAZUH_MANAGER='192.168.1.198' /var/ossec/bin/agent-auth -m 192.168.1.198
              </div>
              <div style="background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 14px; overflow-x: auto;">
                sudo systemctl start wazuh-agent
              </div>
            </div>

            <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h4 style="color: #333; margin-top: 0; margin-bottom: 15px;">🪟 Windows:</h4>
              <div style="background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 14px; margin-bottom: 10px; overflow-x: auto;">
                Invoke-WebRequest -Uri https://packages.wazuh.com/4.x/windows/wazuh-agent-4.12.0-1.msi -OutFile $env:tmp\wazuh-agent; msiexec.exe /i $env:tmp\wazuh-agent /q WAZUH_MANAGER='192.168.1.198'
              </div>
              <div style="background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 14px; overflow-x: auto;">
                NET START WazuhSvc
              </div>
            </div>

            <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h4 style="color: #333; margin-top: 0; margin-bottom: 15px;">🍏 macOS:</h4>
              <div style="background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 14px; margin-bottom: 10px; overflow-x: auto;">
                brew install wazuh/tap/wazuh-agent && sudo WAZUH_MANAGER='192.168.1.198' /Library/Ossec/bin/agent-auth -m 192.168.1.198
              </div>
              <div style="background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 14px; overflow-x: auto;">
                sudo launchctl load /Library/LaunchDaemons/com.wazuh.agent.plist
              </div>
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #856404; margin-top: 0; margin-bottom: 10px;">⚠️ Important Requirements:</h4>
              <ul style="color: #856404; margin-bottom: 0; padding-left: 20px;">
                <li>Administrator privileges are required for installation</li>
                <li>PowerShell 3.0 or greater is required for Windows installations</li>
                <li>Run Windows commands in PowerShell terminal</li>
                <li>Ensure stable internet connectivity during installation</li>
              </ul>
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #856404; margin-top: 0; margin-bottom: 10px;">💡 Pro Tips:</h4>
              <ul style="color: #856404; margin-bottom: 0; padding-left: 20px;">
                <li>Install agents on all critical devices for comprehensive monitoring</li>
                <li>Ensure your devices have stable internet connectivity</li>
                <li>Keep the agent software updated for optimal performance</li>
                <li>Use the exact commands provided for your specific OS and architecture</li>
                <li>Verify agent connection in your dashboard after installation</li>
                <li>Contact support at support@isecurify.com if you encounter any issues</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                Access Your Dashboard
              </a>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                If you have any questions or need assistance with agent setup, please contact our support team at support@isecurify.com
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Agent setup email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending agent setup email:', error);
    return false;
  }
};

// Send password reset email (for future use)
const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  try {
    const transporter = createTransporter();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Your Password - AKSA Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">AKSA Platform</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">By iSecurify</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Hello ${firstName}, we received a request to reset your password for your AKSA Platform account. 
              Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="color: #667eea; font-size: 14px; word-break: break-all; background: #f1f3f4; padding: 10px; border-radius: 5px;">
              ${resetUrl}
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This reset link will expire in 1 hour. If you didn't request a password reset, 
                you can safely ignore this email.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  sendResendVerificationEmail,
  sendAgentSetupEmail,
  sendPasswordResetEmail,
}; 