function pathToRegexpErrorHandler(err, req, res, next) {
  if (err instanceof TypeError && err.message.includes('Missing parameter name')) {
    console.error('Path-to-regexp error:', err.message);
    return res.status(400).json({ error: 'Invalid route parameter in URL.' });
  }
  next(err);
}

module.exports = { pathToRegexpErrorHandler };
