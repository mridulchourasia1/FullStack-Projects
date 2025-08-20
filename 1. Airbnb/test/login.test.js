import request from 'supertest';
import { expect } from 'chai';
import app from '../app.js';
import User from '../models/user.js';
import mongoose from 'mongoose';

describe('Authentication Tests', function() {
  before(async function() {
    // Connect to test database
    await mongoose.connect('mongodb://localhost:27017/testdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // Clear users collection
    await User.deleteMany({});
  });

  after(async function() {
    // Disconnect after tests
    await mongoose.disconnect();
  });

  describe('Signup', function() {
    it('should sign up a new user', async function() {
      const res = await request(app)
        .post('/signup')
        .send({
          username: 'testuser',
          email: 'testuser@example.com',
          password: 'password123'
        });
      expect(res.status).to.equal(302);
      expect(res.headers.location).to.equal('/listings');
    });
  });

  describe('Login', function() {
    it('should login an existing user', async function() {
      const agent = request.agent(app);
      const res = await agent
        .post('/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });
      expect(res.status).to.equal(302);
      expect(res.headers.location).to.equal('/listings');
    });

    it('should fail login with wrong password', async function() {
      const res = await request(app)
        .post('/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });
      expect(res.status).to.equal(302);
      expect(res.headers.location).to.equal('/login');
    });

    // New tests for multiple users login
    it('should sign up and login multiple users successfully', async function() {
      const users = [
        { username: 'user1', email: 'user1@example.com', password: 'password1' },
        { username: 'user2', email: 'user2@example.com', password: 'password2' },
        { username: 'user3', email: 'user3@example.com', password: 'password3' }
      ];

      for (const user of users) {
        // Signup
        const signupRes = await request(app)
          .post('/signup')
          .send({
            username: user.username,
            email: user.email,
            password: user.password
          });
        expect(signupRes.status).to.equal(302);
        expect(signupRes.headers.location).to.equal('/listings');

        // Login
        const agent = request.agent(app);
        const loginRes = await agent
          .post('/login')
          .send({
            username: user.username,
            password: user.password
          });
        expect(loginRes.status).to.equal(302);
        expect(loginRes.headers.location).to.equal('/listings');
      }
    });
  });

  describe('Logout', function() {
    it('should logout a logged-in user', async function() {
      const agent = request.agent(app);
      await agent
        .post('/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });
      const res = await agent.get('/logout');
      expect(res.status).to.equal(302);
      expect(res.headers.location).to.equal('/login');
    });
  });
});
