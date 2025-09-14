import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 30 * 1000, // 30 seconds
  max: 10, // limit each IP to 5 login requests per windowMs
  message: 'Too many login attempts from this IP, please try again after 30 seconds',
  standardHeaders: true,
  legacyHeaders: false,
});

export default loginLimiter;
