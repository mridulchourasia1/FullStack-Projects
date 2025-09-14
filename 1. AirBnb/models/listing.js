import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: Number,
  location: String,
  images: [String],
  country: String,
  createdAt: { type: Date, default: Date.now },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Listing = mongoose.models.Listing || mongoose.model('Listing', listingSchema);

export default Listing;
