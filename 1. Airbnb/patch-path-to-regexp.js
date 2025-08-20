import pathToRegexp from 'path-to-regexp';

// Monkey patch path-to-regexp to ignore invalid parameter names
const originalParse = pathToRegexp.parse;

pathToRegexp.parse = function (str, options) {
  try {
    return originalParse(str, options);
  } catch (err) {
    if (err.message && err.message.includes('Missing parameter name')) {
      // Ignore this error and return empty array to skip invalid route
      console.warn('Warning: Ignored invalid route path due to missing parameter name:', str);
      return [];
    }
    throw err;
  }
};

export default pathToRegexp;
