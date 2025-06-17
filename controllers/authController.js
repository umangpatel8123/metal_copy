import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Auth from '../models/Auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const login = async (req, res) => {
  try {
    const { pin } = req.body;
    const auth = await Auth.findOne();
    if (!auth) return res.status(404).json({ error: 'PIN not set' });

    const match = await bcrypt.compare(pin, auth.pin);
    if (!match) return res.status(401).json({ error: 'Incorrect PIN' });

    const token = jwt.sign({ loggedIn: true }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const setPin = async (req, res) => {
  try {
    const { pin } = req.body;
    if (!/^\d{6}$/.test(pin)) return res.status(400).json({ error: 'PIN must be 6 digits' });

    const hashedPin = await bcrypt.hash(pin, 10);

    let auth = await Auth.findOne();
    if (auth) {
      auth.pin = hashedPin;
      await auth.save();
    } else {
      await Auth.create({ pin: hashedPin });
    }

    res.json({ message: 'PIN set successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
