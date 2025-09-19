const nodemailer = require('nodemailer');
const crypto = require('crypto');

class EmailService {
  constructor() {
    // Configure email transporter based on environment
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER, // your email
        pass: process.env.SMTP_PASS  // your email password or app password
      }
    });
  }

  // Generate 6-digit OTP
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Send OTP email
  async sendOTPEmail(email, otp, type = 'registration') {
    try {
      const subject = type === 'registration' 
        ? 'SkillBarter - Email Verification' 
        : 'SkillBarter - Password Reset';
      
      const html = this.getOTPEmailTemplate(otp, type);

      const mailOptions = {
        from: `"SkillBarter" <${process.env.SMTP_USER}>`,
        to: email,
        subject: subject,
        html: html
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // OTP email template
  getOTPEmailTemplate(otp, type) {
    const title = type === 'registration' 
      ? 'Welcome to SkillBarter!' 
      : 'Password Reset Request';
    
    const message = type === 'registration'
      ? 'Thank you for registering with SkillBarter. Please verify your email address using the OTP below:'
      : 'You have requested to reset your password. Use the OTP below to proceed with password reset:';

    const actionText = type === 'registration'
      ? 'This OTP is required to complete your registration and access the platform.'
      : 'If you did not request a password reset, please ignore this email. This OTP will expire in 10 minutes for security.';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-code { background: #667eea; color: white; padding: 15px 30px; font-size: 24px; font-weight: bold; text-align: center; border-radius: 8px; margin: 20px 0; letter-spacing: 3px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 SkillBarter</h1>
            <p>${title}</p>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>${message}</p>
            
            <div class="otp-code">
              ${otp}
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul>
                <li>This OTP is valid for 10 minutes only</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
            
            <p>Best regards,<br>The SkillBarter Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; 2025 SkillBarter. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Test email configuration
  async testConnection() {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('❌ Email service configuration error:', error);
      return false;
    }
  }
}

module.exports = new EmailService();