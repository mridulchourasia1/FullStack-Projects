const request = require('supertest');
const app = require('../app.js');

describe('Middleware and Routes Integration Tests', () => {
  it('should respond to /test route', async () => {
    const res = await request(app).get('/test');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Test route is working');
  });

  it('should redirect /createListing to /listings/createListing', async () => {
    const res = await request(app).get('/createListing');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/listings/createListing');
  });

  it('should return 404 for unknown route', async () => {
    const res = await request(app).get('/unknownroute');
    expect(res.statusCode).toBe(404);
  });

  it('should set session cookie on /session-test', async () => {
    const res = await request(app).get('/session-test');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Session test successful');
    expect(res.headers['set-cookie']).toBeDefined();
  });
});
