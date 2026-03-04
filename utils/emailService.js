// utils/emailService.js
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter
transporter.verify((error) => {
  if (error) {
    console.error('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email transporter ready');
  }
});

// ─────────────────────────────────────────────
//  Send verification email
// ─────────────────────────────────────────────
exports.sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.BACKEND_URL}/api/auth/verify-email/${token}`;
  const frontendUrl = process.env.FRONTEND_URL;

  const mailOptions = {
    from: `"🕉 Gita Wisdom" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Verify Your Email - Gita Wisdom',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Arial', sans-serif; background: #0a0608; color: #e8dcc8; padding: 40px; }
          .container { max-width: 500px; margin: 0 auto; background: #0f0a10; border: 1px solid #d4a84333; padding: 40px; border-radius: 4px; }
          .om { font-size: 48px; text-align: center; margin-bottom: 20px; color: #d4a843; }
          h1 { text-align: center; font-family: 'Cinzel', serif; color: #d4a843; margin-bottom: 20px; }
          p { line-height: 1.6; color: #9a8a72; margin-bottom: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #d4a843, #b8892a); color: #000; text-decoration: none; border-radius: 2px; font-weight: bold; letter-spacing: 1px; margin: 20px 0; }
          .footer { margin-top: 40px; font-size: 12px; color: #5a4e3a; text-align: center; border-top: 1px solid #d4a8431a; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="om">🕉</div>
          <h1>Welcome, ${user.name}!</h1>
          <p>Thank you for joining Gita Wisdom. Please verify your email address to begin your spiritual journey through the Bhagavad Gita.</p>
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">VERIFY EMAIL</a>
          </div>
          <p style="font-size: 14px;">If the button doesn't work, copy this link:<br><span style="color: #d4a843;">${verificationUrl}</span></p>
          <p>This link expires in 24 hours.</p>
          <div class="footer">
            <p>🪷 Gita Wisdom — Eternal Knowledge for Modern Life</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
};

// ─────────────────────────────────────────────
//  Send password reset email
// ─────────────────────────────────────────────
exports.sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password.html?token=${token}`;

  const mailOptions = {
    from: `"🕉 Gita Wisdom" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Reset Your Password - Gita Wisdom',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; background: #0a0608; color: #e8dcc8; padding: 40px; }
          .container { max-width: 500px; margin: 0 auto; background: #0f0a10; border: 1px solid #d4a84333; padding: 40px; border-radius: 4px; }
          .om { font-size: 48px; text-align: center; margin-bottom: 20px; color: #d4a843; }
          h1 { text-align: center; font-family: 'Cinzel', serif; color: #d4a843; margin-bottom: 20px; }
          p { line-height: 1.6; color: #9a8a72; margin-bottom: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #d4a843, #b8892a); color: #000; text-decoration: none; border-radius: 2px; font-weight: bold; letter-spacing: 1px; margin: 20px 0; }
          .footer { margin-top: 40px; font-size: 12px; color: #5a4e3a; text-align: center; border-top: 1px solid #d4a8431a; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="om">🕉</div>
          <h1>Password Reset</h1>
          <p>We received a request to reset your password. Click the button below to set a new password.</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">RESET PASSWORD</a>
          </div>
          <p style="font-size: 14px;">If the button doesn't work, copy this link:<br><span style="color: #d4a843;">${resetUrl}</span></p>
          <p>This link expires in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <div class="footer">
            <p>🪷 Gita Wisdom — Eternal Knowledge for Modern Life</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
};

// ─────────────────────────────────────────────
//  Send welcome email (after verification)
// ─────────────────────────────────────────────
exports.sendWelcomeEmail = async (user) => {
  const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard.html`;

  const mailOptions = {
    from: `"🕉 Gita Wisdom" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Welcome to Gita Wisdom! 🙏',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; background: #0a0608; color: #e8dcc8; padding: 40px; }
          .container { max-width: 500px; margin: 0 auto; background: #0f0a10; border: 1px solid #d4a84333; padding: 40px; border-radius: 4px; }
          .om { font-size: 48px; text-align: center; margin-bottom: 20px; color: #d4a843; }
          h1 { text-align: center; font-family: 'Cinzel', serif; color: #d4a843; margin-bottom: 20px; }
          p { line-height: 1.6; color: #9a8a72; margin-bottom: 30px; }
          .shlok { background: rgba(212,168,67,0.05); border-left: 2px solid #d4a843; padding: 20px; margin: 30px 0; font-style: italic; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #d4a843, #b8892a); color: #000; text-decoration: none; border-radius: 2px; font-weight: bold; letter-spacing: 1px; margin: 20px 0; }
          .footer { margin-top: 40px; font-size: 12px; color: #5a4e3a; text-align: center; border-top: 1px solid #d4a8431a; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="om">🕉</div>
          <h1>Welcome, ${user.name}!</h1>
          <p>Your email has been verified. You are now ready to begin your journey through the timeless wisdom of the Bhagavad Gita.</p>
          
          <div class="shlok">
            <p style="color: #f0c96a;">कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।<br>मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥</p>
            <p style="color: #9a8a72; font-size: 14px;">"You have the right to perform your duties, but never to the fruits of your actions." — Gita 2.47</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${dashboardUrl}" class="button">START YOUR JOURNEY</a>
          </div>
          
          <div class="footer">
            <p>🪷 Gita Wisdom — Eternal Knowledge for Modern Life</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
};

// ─────────────────────────────────────────────
//  Send daily shlok email
// ─────────────────────────────────────────────
exports.sendDailyShlokEmail = async (user, shlok) => {
  const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard.html`;

  const mailOptions = {
    from: `"🕉 Gita Wisdom" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: '🌅 Your Daily Shlok - Gita Wisdom',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; background: #0a0608; color: #e8dcc8; padding: 40px; }
          .container { max-width: 500px; margin: 0 auto; background: #0f0a10; border: 1px solid #d4a84333; padding: 40px; border-radius: 4px; }
          .om { font-size: 48px; text-align: center; margin-bottom: 20px; color: #d4a843; }
          h1 { text-align: center; font-family: 'Cinzel', serif; color: #d4a843; margin-bottom: 20px; }
          .shlok-box { background: rgba(212,168,67,0.03); border: 1px solid #d4a84333; padding: 30px; margin: 30px 0; text-align: center; }
          .sanskrit { font-size: 20px; color: #f0c96a; line-height: 1.8; margin-bottom: 20px; }
          .meaning { color: #9a8a72; font-size: 14px; line-height: 1.6; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #d4a843, #b8892a); color: #000; text-decoration: none; border-radius: 2px; font-weight: bold; letter-spacing: 1px; margin: 20px 0; }
          .footer { margin-top: 40px; font-size: 12px; color: #5a4e3a; text-align: center; border-top: 1px solid #d4a8431a; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="om">🕉</div>
          <h1>Your Daily Shlok</h1>
          
          <div class="shlok-box">
            <div class="sanskrit">${shlok.sanskrit}</div>
            <div class="meaning">${shlok.english}</div>
            <p style="color: #d4a843; margin-top: 15px;">— Chapter ${shlok.chapter}, Verse ${shlok.verse}</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${dashboardUrl}" class="button">READ MORE SHLOKAS</a>
          </div>
          
          <div class="footer">
            <p>🪷 Gita Wisdom — Eternal Knowledge for Modern Life</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
};