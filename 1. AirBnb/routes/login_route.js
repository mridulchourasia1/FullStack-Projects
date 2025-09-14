import express from 'express';
import passport from 'passport';
import loginLimiter from '../middleware/rateLimiter.js';

const router = express.Router();

// GET /login - render login form or redirect if authenticated
router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/listings');
  }
  res.render('login', { messages: req.flash() });
});

// POST /login - authenticate user
router.post('/login', loginLimiter, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash('error', info.message || 'Invalid username or password');
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      // Handle "Remember Me" checkbox
      if (req.body.rememberMe) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      } else {
        req.session.cookie.expires = false; // Session cookie
      }
      console.log('User logged in:', user);
      return res.redirect('/listings');
    });
  })(req, res, next);
});

// GET /logout - log out user
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

export default router;
