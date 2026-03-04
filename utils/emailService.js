// utils/emailService.js - FINAL VERSION
// Email functions are DISABLED for testing - no dependencies, no errors

// ─────────────────────────────────────────────
//  Helper function to log emails (no actual sending)
// ─────────────────────────────────────────────
function logEmail(type, email, name, details = '') {
  console.log(`🕉 ───────────────────────────────────`);
  console.log(`📧 [${type}] Email would be sent to:`);
  console.log(`   📨 To: ${email}`);
  console.log(`   👤 Name: ${name}`);
  if (details) console.log(`   📝 ${details}`);
  console.log(`   ⚡ Email sending is DISABLED (testing mode)`);
  console.log(`🕉 ───────────────────────────────────`);
  return { success: true, message: 'Email disabled (testing mode)' };
}

// ─────────────────────────────────────────────
//  Send verification email (DISABLED)
// ─────────────────────────────────────────────
exports.sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/verify-email/${token}`;
  logEmail('VERIFICATION', user.email, user.name, `Token: ${token.substring(0,10)}...`);
  return { success: true };
};

// ─────────────────────────────────────────────
//  Send password reset email (DISABLED)
// ─────────────────────────────────────────────
exports.sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password.html?token=${token}`;
  logEmail('PASSWORD RESET', user.email, user.name, `Token: ${token.substring(0,10)}...`);
  return { success: true };
};

// ─────────────────────────────────────────────
//  Send welcome email (DISABLED)
// ─────────────────────────────────────────────
exports.sendWelcomeEmail = async (user) => {
  logEmail('WELCOME', user.email, user.name);
  return { success: true };
};

// ─────────────────────────────────────────────
//  Send daily shlok email (DISABLED)
// ─────────────────────────────────────────────
exports.sendDailyShlokEmail = async (user, shlok) => {
  const shlokInfo = shlok ? `Chapter ${shlok.chapter}, Verse ${shlok.verse}` : '';
  logEmail('DAILY SHLOK', user.email, user.name, shlokInfo);
  return { success: true };
};