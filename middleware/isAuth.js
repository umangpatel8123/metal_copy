// middleware/isAuth.js
import jwt from 'jsonwebtoken';

export const isAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, msg: 'Missing or malformed token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token has the expected structure
    if (!decoded?.loggedIn) {
      return res.status(401).json({ success: false, msg: 'Invalid token payload' });
    }

    // Optionally attach decoded info to the request
    req.auth = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ success: false, msg: 'Invalid or expired token' });
  }
};
