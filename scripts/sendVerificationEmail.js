const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors')({ origin: ['http://127.0.0.1:5504', 'http://localhost:5504', 'https://nbi-green-economy.web.app'] });

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nbigreeneconomy@gmail.com',
    pass: functions.config().gmail.app_password
  }
});

exports.sendVerificationEmail = functions.https.onCall((data, context) => {
  return cors(data, context, async () => {
    const { email, code } = data;

    if (email !== 'nbigreeneconomy@gmail.com') {
      throw new functions.https.HttpsError('permission-denied', 'Invalid email address');
    }

    const mailOptions = {
      from: 'nbigreeneconomy@gmail.com',
      to: email,
      subject: 'Your Admin Verification Code - Aug 15, 2025, 21:30 SAST',
      text: `Your verification code is: ${code}\nThis code expires in 10 minutes.\nGenerated at: 09:30 PM SAST, Friday, August 15, 2025`,
      html: `<p>Your verification code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p><p>Generated at: 09:30 PM SAST, Friday, August 15, 2025</p>`
    };

    try {
      const result = await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${email} at 09:30 PM SAST, Aug 15, 2025`, result);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending email:', error, { email, code });
      throw new functions.https.HttpsError('internal', 'Failed to send verification email', error.message);
    }
  });
});