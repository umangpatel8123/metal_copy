import express from 'express';
import { login, setPin ,checkPinExists} from '../controllers/authController.js';
import { sendOtp, verifyOtpAndResetPin} from '../controllers/otpController.js';

const router = express.Router();
//env
router.post('/login', login);
router.post('/set-pin', setPin);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtpAndResetPin);
router.get('/pin-exists', checkPinExists);

export default router;
