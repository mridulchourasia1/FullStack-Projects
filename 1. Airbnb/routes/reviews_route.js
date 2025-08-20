import express from 'express';
import Review from '../models/review.js';
import Listing from '../models/listing.js';
import Joi from 'joi';
import { ExpressError } from '../util/ExpressError.js';

import { isLoggedIn, isLoggedInAPI } from '../middleware.js';

const router = express.Router();

const reviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().min(1).required()
});

function validateReview(req, res, next) {
  const { error, value } = reviewSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  req.validatedBody = value;
  next();
}

// Middleware to check if the logged-in user is the owner of the review
async function isReviewOwner(req, res, next) {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    if (review.owner.equals(req.user._id)) {
      return next();
    } else {
      return res.status(403).json({ error: 'You do not have permission to do that' });
    }
  } catch (err) {
    return next(err);
  }
}

// POST route to submit a review for a listing
router.post('/:id/reviews', isLoggedInAPI, validateReview, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    console.log('Received review submission:', { id, rating, comment });

    // Create new review document with owner
    const newReview = new Review({
      rating: Number(rating),
      comment: comment,
      owner: req.user._id
    });
    await newReview.save();
    console.log('Saved new review:', newReview);

    // Find listing and add review reference
    const listing = await Listing.findById(id).populate('owner');
    if (!listing) {
      console.error('Listing not found for id:', id);
      return res.status(404).json({ error: 'Listing not found' });
    }
    if (!listing.owner) {
      console.error('Listing owner is missing for id:', id);
      return res.status(500).json({ error: 'Listing owner is missing, cannot save review' });
    }
    listing.reviews.push(newReview._id);
    // Ensure owner is set as ObjectId, not populated object
    if (typeof listing.owner === 'object' && listing.owner._id) {
      listing.owner = listing.owner._id;
    }
    await listing.save();
    console.log('Updated listing with new review:', listing);

    // Log the new review details in terminal
    console.log('New Review Details:');
    console.log(`Rating: ${newReview.rating}`);
    console.log(`Comment: ${newReview.comment}`);

    res.status(201).json({ 
      message: 'Review submitted successfully',
      review: {
        rating: newReview.rating,
        comment: newReview.comment
      }
    });
  } catch (err) {
    console.error('Error in review submission:', err);
    console.error(err.stack);
    next(err);
  }
});

// DELETE route to delete a review by ID
router.delete('/reviews/:reviewId', isLoggedIn, isReviewOwner, async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    // Find the review to delete
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Find the listing that contains this review
    const listing = await Listing.findOne({ reviews: reviewId });
    if (listing) {
      // Remove the review reference from the listing's reviews array
      listing.reviews.pull(reviewId);
      await listing.save();
    }

    // Delete the review document
    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
