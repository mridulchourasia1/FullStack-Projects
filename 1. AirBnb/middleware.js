// Wrapped imports in try-catch to catch unsupported module errors
let express, path, fileURLToPath, ejsMate, session, flash, MongoStore, passport, localStrategy, User;

try {
  express = await import('express').then(mod => mod.default);
  path = await import('path').then(mod => mod.default);
  fileURLToPath = (await import('url')).fileURLToPath;
  ejsMate = await import('ejs-mate').then(mod => mod.default);
  session = await import('express-session').then(mod => mod.default);
  flash = await import('connect-flash').then(mod => mod.default);
  MongoStore = (await import('connect-mongo')).default;

  passport = await import('passport').then(mod => mod.default);
  localStrategy = await import('passport-local').then(mod => mod.default);
  User = (await import('./models/user.js')).default;
} catch (error) {
  console.error('Error importing modules in middleware.js:', error);
  throw error;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function setupMiddleware(app) {
  /* app.use(cookieParser()); */

  const mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/your-db-name';

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(session({
    store: MongoStore.create({
      mongoUrl,
      touchAfter: 24 * 3600 // time period in seconds
    }),
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: new Date(Date.now() + 7*24*60*60*1000),
      httpOnly: true,
      // secure: true, // Uncomment if using HTTPS
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(new localStrategy(User.authenticate()));
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  app.use(flash());

  // Middleware to make flash messages and user available in all views
  app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.user = req.user;
    next();
  });
  app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from public directory

  // Serve static files from style directory for CSS
  app.use('/style', express.static(path.join(__dirname, 'style')));

  // Middleware to track routes and set cookies
  /* app.use((req, res, next) => {
    const routeHistory = req.cookies.routeHistory ? JSON.parse(req.cookies.routeHistory) : [];
    routeHistory.push(req.originalUrl);
    // Keep only last 5 routes to limit cookie size
    if (routeHistory.length > 5) {
      routeHistory.shift();
    }
    res.cookie('routeHistory', JSON.stringify(routeHistory), { httpOnly: true });
    next();
  }); */

  // Set EJS as the view engine
  app.engine('ejs', ejsMate); // Use ejs-mate for EJS layout support
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
}

// Authorization middleware to check if user is logged in
export function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'You must be signed in first!');
  res.redirect('/login');
}

// Authorization middleware for API routes to check if user is logged in
export function isLoggedInAPI(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'You must be signed in first!' });
}
