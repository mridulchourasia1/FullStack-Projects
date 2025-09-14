import 'dotenv/config';
import './patch-path-to-regexp.js';
import express from 'express';
import { connectDB } from './db.js';
import { setupMiddleware } from './middleware.js';
import { ExpressError } from './util/ExpressError.js';

import listingRouter from './routes/listing_route.js';
import reviewsRouter from './routes/reviews_route.js';
import classroomRouter from './classroom/classroom_route.js';
import passport from 'passport';
import localStrategy from 'passport-local';
import User from './models/user.js';

import session from 'express-session';
import MongoStore from 'connect-mongo';

const app = express();

// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/web1";

connectDB();

app.use(session({
  secret: process.env.SESSION_SECRET || 'thisshouldbeabettersecret!',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: mongoURI,
    touchAfter: 24 * 3600 // time period in seconds
  }),
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

setupMiddleware(app);

app.use('/listings', (req, res, next) => {
  if (req.path.startsWith('/listing/')) {
    const newPath = req.path.replace('/listing/', '/');
    return res.redirect(301, '/listings' + newPath + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''));
  }
  next();
});
app.use('/listings', listingRouter);
app.use('/listings', reviewsRouter);
app.use('/classroom', classroomRouter);

// Test route to verify server routing
app.get('/test', (req, res) => {
  res.send('Test route is working');
});

import demouserRouter from './routes/demouser_route.js';
import signupRouter from './routes/signup_route.js';
import loginRouter from './routes/login_route.js';

app.use('/', demouserRouter);
app.use('/', signupRouter);
app.use('/', loginRouter);

// Removed the existing /demouser route from here as it is duplicated and incorrect
// The /demouser route will be handled by the new demouserRouter imported from routes/demouser_route.js

app.get('/session-test', (req, res) => {
  req.session.test = 'Session test successful';
  res.send(req.session.test);
});

// Redirect root route to /listings to render index.ejs with listings
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// Redirect common routes without /listings prefix to correct routes
app.get('/createListing', (req, res) => {
  res.redirect('/listings/createListing');
});
app.get('/listing', (req, res) => {
  res.redirect('/listings/listing');
});
app.get('/editListing/:id', (req, res) => {
  res.redirect(`/listings/editListing/${req.params.id}`);
});

// Serve the listingPage.html file at /listingPage route
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.get('/listingPage', (req, res) => {
  res.sendFile(path.join(__dirname, 'listingPage.html'));
});

// Catch-all route for unmatched routes (404)
app.all("*", (req, res, next) => {
  console.log(`404 Error: Page Not Found for URL ${req.originalUrl}`);
  next(new ExpressError("Page Not Found", 404));
});

// Serve a default favicon to avoid 404 errors for favicon.ico requests
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Centralized error logging middleware
app.use((err, req, res, next) => {
  console.error('Centralized error logging:', err.stack || err);
  next(err);
});

// Error handling middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  if (statusCode === 404) {
    return res.status(404).render('404', { statusCode, message });
  }
  res.status(statusCode).render('error', { statusCode, message });
});

const PORT = process.env.PORT || 3000;

console.log('Environment variables at startup:');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`MONGODB_URI: ${process.env.MONGODB_URI}`);
console.log(`SESSION_SECRET: ${process.env.SESSION_SECRET ? 'Set' : 'Not Set'}`);
console.log(`PORT: ${process.env.PORT}`);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

export default app;
