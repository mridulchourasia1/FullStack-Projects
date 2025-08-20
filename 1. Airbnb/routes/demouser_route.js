import express from 'express';
import * as User from '../models/user.js';
import passport from 'passport';

const router = express.Router();

function generateUniqueUsername() {
  return 'demoUser_' + Date.now();
}

function generateUniquePassword() {
  return 'pass_' + Math.random().toString(36).slice(-8);
}

router.get('/demouser', async (req, res, next) => {
  try {
    const username = generateUniqueUsername();
    const password = generateUniquePassword();
    const demoUser = new User({ username: username, email: `${username}@example.com` });
    await User.register(demoUser, password);

    req.login(demoUser, (err) => {
      if (err) {
        return next(err);
      }
      res.json({
        message: 'Demo user created and logged in successfully',
        user: { username: username, email: demoUser.email },
        password: password
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
