import chai from 'chai';
import mongoose from 'mongoose';
import UserModel from '../modals/user.js';

const expect = chai.expect;

describe('Demo User Tests', function() {
before(async function() {
  // Connect to the test database
  await mongoose.connect('mongodb://localhost:27017/demoUserTestDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

  after(async function() {
    // Disconnect from the database after all tests
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async function() {
    // Clear users before each test
    await UserModel.deleteMany({});
  });

  it('should create a demo user successfully', async function() {
    const demoUser = new UserModel({ username: 'demoUser', email: 'demo@example.com' });
    await UserModel.register(demoUser, 'password123'); // Using passport-local-mongoose register method

    const foundUser = await UserModel.findOne({ username: 'demoUser' });
    expect(foundUser).to.exist;
    expect(foundUser.email).to.equal('demo@example.com');
  });

  it('should authenticate the demo user with correct password', async function() {
    const demoUser = new UserModel({ username: 'demoUser', email: 'demo@example.com' });
    await UserModel.register(demoUser, 'password123');

    const authenticatedUser = await UserModel.authenticate()('demoUser', 'password123');
    expect(authenticatedUser.user).to.exist;
    expect(authenticatedUser.user.username).to.equal('demoUser');
  });

  it('should fail authentication with incorrect password', async function() {
    const demoUser = new UserModel({ username: 'demoUser', email: 'demo@example.com' });
    await UserModel.register(demoUser, 'password123');

    const authenticatedUser = await UserModel.authenticate()('demoUser', 'wrongpassword');
    expect(authenticatedUser.user).to.not.exist;
    expect(authenticatedUser.error).to.exist;
  });

  // Additional edge case tests

  it('should fail to register a user without username', async function() {
    const demoUser = new UserModel({ email: 'nousername@example.com' });
    try {
      await UserModel.register(demoUser, 'password123');
      throw new Error('User registration should have failed without username');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should fail to register a user without password', async function() {
    const demoUser = new UserModel({ username: 'nopassword', email: 'nopassword@example.com' });
    try {
      // @ts-ignore
      await UserModel.register(demoUser, null);
      throw new Error('User registration should have failed without password');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should fail to register duplicate username', async function() {
    const demoUser1 = new UserModel({ username: 'duplicateUser', email: 'dup1@example.com' });
    await UserModel.register(demoUser1, 'password123');

    const demoUser2 = new UserModel({ username: 'duplicateUser', email: 'dup2@example.com' });
    try {
      await UserModel.register(demoUser2, 'password123');
      throw new Error('User registration should have failed for duplicate username');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should fail to authenticate with missing username', async function() {
    const authenticate = UserModel.authenticate();
    try {
      await authenticate(null, 'password123');
      throw new Error('Authentication should have failed with missing username');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should fail to authenticate with missing password', async function() {
    const authenticate = UserModel.authenticate();
    try {
      await authenticate('demoUser', null);
      throw new Error('Authentication should have failed with missing password');
    } catch (err) {
      expect(err).to.exist;
    }
  });
});
