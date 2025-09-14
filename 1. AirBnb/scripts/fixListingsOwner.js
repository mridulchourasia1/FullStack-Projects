import mongoose from 'mongoose';
import Listing from '../modals/listing.js';
import User from '../modals/user.js';

async function fixListingsOwner() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/web1';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find the user "mridul" to assign as owner
    const defaultUser = await User.findOne({ username: 'mridul' });
    if (!defaultUser) {
      console.error('User "mridul" not found in the database. Please create the user first.');
      process.exit(1);
    }

    // Find listings with missing or null owner field
    const listingsWithoutOwner = await Listing.find({ $or: [ { owner: { $exists: false } }, { owner: null } ] });
    console.log(`Found ${listingsWithoutOwner.length} listings without owner.`);

    for (const listing of listingsWithoutOwner) {
      listing.owner = defaultUser._id;
      await listing.save();
      console.log(`Updated listing ${listing._id} with default owner ${defaultUser._id}`);
    }

    console.log('Finished fixing listings owner field.');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing listings owner:', err);
    process.exit(1);
  }
}

fixListingsOwner();
