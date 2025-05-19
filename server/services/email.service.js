import nodemailer from 'nodemailer';
import { decryptService } from './index.js';
import { env } from '../config/index.js';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: env.email.username,
    pass: env.email.password, // App password if using Gmail
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
  },
});

export const sendResetPasswordEmailService = async (payload) => {
  const decryptedPayload = await decryptService(payload);
  const { to, resetLink, first_name } = decryptedPayload;

  const mailOptions = {
    from: `"Response360 Support" <${env.email.username}>`,
    to,
    subject: 'Reset Your Response360 Password',
    html: `
      <p>Hi ${first_name || 'there'},</p>
      <p>You requested to reset your Response360 password. Click the link below to continue:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>If you didn’t request this, just ignore this email.</p>
      <p>– The Response360 Team</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Reset email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending reset email:', error);
    return false;
  }
};
