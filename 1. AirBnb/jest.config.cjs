module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleFileExtensions: ['js', 'json', 'node'],
  testMatch: ['**/test/**/*.test.js'],
};
