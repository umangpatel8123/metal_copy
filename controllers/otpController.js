import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import Auth from '../models/Auth.js';

const ALLOWED_EMAILS = ['umang3967@gmail.com', 'piyuthehero@gmail.com','creativebirdstudio@gmail.com'];

const otpStore = {};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.OTP_EMAIL,
    pass: process.env.OTP_EMAIL_PASS
  }
});

export const sendOtp = async (req, res) => {
    try {
      const { email } = req.body;
  
      if (!ALLOWED_EMAILS.includes(email))
        return res.status(403).json({ error: 'Unauthorized email' });
  
      const otp = crypto.randomInt(100000, 999999).toString();
      otpStore[email] = otp;
  
      // 🕒 Auto-expire after 5 minutes (300,000 ms)
      setTimeout(() => {
        delete otpStore[email];
      }, 5 * 60 * 1000);
  
      await transporter.sendMail({
        from: process.env.OTP_EMAIL,
        to: email,
        subject: 'PIN Reset OTP',
        text: `Your OTP is: ${otp} (expires in 5 minutes)`
      });
  
      res.json({ message: 'OTP sent successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  

export const verifyOtpAndResetPin = async (req, res) => {
  try {
    const { email, otp, newPin } = req.body;

    if (!ALLOWED_EMAILS.includes(email)) return res.status(403).json({ error: 'Unauthorized email' });
    if (otpStore[email] !== otp) return res.status(400).json({ error: 'Invalid or expired OTP' });
    if (!/^\d{6}$/.test(newPin)) return res.status(400).json({ error: 'PIN must be 6 digits' });

    const hashedPin = await bcrypt.hash(newPin, 10);
    let auth = await Auth.findOne();

    if (!auth) auth = await Auth.create({ pin: hashedPin });
    else {
      auth.pin = hashedPin;
      await auth.save();
    }

    delete otpStore[email];
    res.json({ message: 'PIN reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};