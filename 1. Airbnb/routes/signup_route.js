
import express from 'express';
import User from '../models/user.js';
import passport from 'passport';
import { signupSchema } from '../schema.js';
import { ExpressError } from '../util/ExpressError.js';

const router = express.Router();

function validateSignup(req, res, next) {
  const { error, value } = signupSchema.validate(req.body);
  if (error) {
    const err = new ExpressError(error.details[0].message, 400);
    return next(err);
  }
  req.validatedBody = value;
  next();
}


// GET /signup - render signup form
router.get('/signup', (req, res) => {
  res.render('signup');
});

// POST /signup - handle signup form submission
router.post('/signup', validateSignup, async (req, res, next) => {
  try {
    const { username, email, password } = req.validatedBody;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    console.log('Registered User:', registeredUser);
    req.login(registeredUser, err => {
      if (err) return next(err);
      req.flash('success', `Welcome, ${registeredUser.username}!`);
      res.redirect('/listings');
    });
  } catch (e) {
    console.log(e);
    req.flash('error', e.message);
    res.render('signup', { error: e.message });
  }
});

export default router;
