import mongoose from 'mongoose';
import Listing from '../models/listing.js';
import { data as sampleListings } from './data.js';

const mongoUri = 'mongodb://localhost:27017/web1';

async function initDb() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing listings
    await Listing.deleteMany({});
    console.log('Cleared existing listings');

    // Transform sample data to match schema
    const listingsToInsert = sampleListings.map(listing => ({
      title: listing.title,
      description: listing.description,
      price: listing.price,
      location: listing.location,
      country: listing.country,
      images: listing.image ? [listing.image.url] : [],
    }));

    // Insert sample listings
    await Listing.insertMany(listingsToInsert);
    console.log('Inserted sample listings');

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDb();
