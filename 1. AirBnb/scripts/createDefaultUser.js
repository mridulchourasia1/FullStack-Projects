import mongoose from 'mongoose';
import User from '../modals/user.js';

async function createDefaultUser() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/web1';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const existingUser = await User.findOne({ username: 'mridul' });
    if (existingUser) {
      console.log('Default user "mridul" already exists.');
      process.exit(0);
    }

    const newUser = new User({
      username: 'mridul',
      email: 'mridul@example.com'
    });

    await User.register(newUser, 'defaultpassword123').catch(err => {
      console.error('Error during user registration:', err);
      process.exit(1);
    });

    console.log('Default user "mridul" created successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error creating default user:', err);
    process.exit(1);
  }
}

createDefaultUser();
