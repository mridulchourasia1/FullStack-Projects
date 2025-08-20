import express from 'express';
import Listing from '../models/listing.js';
import Review from '../models/review.js';
import { listingSchema } from '../schema.js';
import { ExpressError } from '../util/ExpressError.js';
import { isLoggedIn } from '../middleware.js';
import User from '../models/user.js';
const router = express.Router();

async function isOwner(req, res, next) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash('error', 'Listing not found');
      return res.redirect('/listings');
    }
    if (listing.owner.equals(req.user._id)) {
      return next();
    } else {
      req.flash('error', 'You do not have permission to do that');
      return res.redirect('/listings');
    }
  } catch (err) {
    return next(err);
  }
}

function validateListing(req, res, next) {
  const { error, value } = listingSchema.validate(req.body);
  if (error) {
    const err = new ExpressError(error.details[0].message, 400);
    return next(err);
  }
  req.validatedBody = value;
  next();
}

// Consolidated /listings route
router.get("/", async (req, res) => {
  try {
    const allListings = await Listing.find({}).populate('owner').lean();
    res.render("index", { allListings, user: req.user });
  } catch (err) {
    console.error("Failed to fetch listings", err);
    res.status(500).send("Failed to fetch listings");
  }
});

router.get("/clearListings", isLoggedIn, async (req, res) => {
  try {
    await Listing.deleteMany({});
    console.log("All listings cleared");
    res.send("All listings cleared");
  } catch (err) {
    console.error("Failed to clear listings", err);
    res.status(500).send("Failed to clear listings");
  }
});

router.get("/listing", isLoggedIn, async (req, res) => {
  try {
    const listings = await Listing.find().lean();
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

import debug from 'debug';
const log = debug('app:createListingRoute');

router.route('/createListing')
  .get(isLoggedIn, (req, res) => {
    log('GET /createListing route hit');
    res.render('createListing');
  })
  .post(isLoggedIn, validateListing, async (req, res, next) => {
    try {
      console.log('Received create listing request body:', req.body);
      // Parse price after validation
      const priceValue = parseFloat(req.validatedBody.price);
      if (isNaN(priceValue) || priceValue < 0) {
        console.error('Invalid price value:', req.validatedBody.price);
        return res.status(400).send('Price must be a non-negative number');
      }
      let imagesArray = [];
      if (req.body.images && req.body.images.trim() !== '') {
        imagesArray = req.body.images.split(',').map(img => img.trim());
      } else {
        console.warn('No image URLs received in the request');
      }
      let ownerId = req.user ? req.user._id : null;
      if (!ownerId) {
        // Enforce login
        req.flash('error', 'You must be logged in to create a listing.');
        return res.redirect('/login');
      }
      const newListing = new Listing({
        title: req.validatedBody.title,
        description: req.validatedBody.description,
        price: priceValue,
        location: req.validatedBody.location,
        images: imagesArray,
        owner: ownerId
      });
      await newListing.save();
      req.flash('success', 'Listing created successfully!');
      return res.redirect('/listings');
    } catch (err) {
      console.error('Failed to create listing:', err.stack || err);
      req.flash('error', 'Failed to create listing. Please try again.');
      next(err);
    }
  });

  
// New route to show full details of a listing by id
router.get("/listing/:id", async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate({
      path: 'reviews',
      populate: {
        path: 'owner',
        select: 'username _id'
      }
    }).lean();
    if (!listing) {
      throw new ExpressError("Listing not found", 404);
    }
    res.render("listing", { listing, user: req.user });
  } catch (err) {
    next(err);
  }
});

// Added route to handle /:id to fix 404 for /listings/:id
router.get("/:id", async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate({
      path: 'reviews',
      populate: {
        path: 'owner',
        select: 'username _id'
      }
    }).lean();
    if (!listing) {
      throw new ExpressError("Listing not found", 404);
    }
    res.render("listing", { listing, user: req.user });
  } catch (err) {
    next(err);
  }
});

router.route('/editListing/:id')
  .get(isLoggedIn, isOwner, async (req, res, next) => {
    try {
      const listing = await Listing.findById(req.params.id).lean();
      if (!listing) {
        throw new ExpressError('Listing not found', 404);
      }
      res.render('editListing', { listing });
    } catch (err) {
      next(err);
    }
  })
  .post(isLoggedIn, isOwner, validateListing, async (req, res) => {
    try {
      // Parse price and images after validation
      const priceValue = parseFloat(req.validatedBody.price);
      if (isNaN(priceValue) || priceValue < 0) {
        return res.status(400).send('Price must be a non-negative number');
      }

      let imagesArray = [];
      if (req.body.images && req.body.images.trim() !== '') {
        imagesArray = req.body.images.split(',').map(img => img.trim());
      }

      await Listing.findByIdAndUpdate(req.params.id, {
        title: req.validatedBody.title,
        description: req.validatedBody.description,
        price: priceValue,
        location: req.validatedBody.location,
        images: imagesArray
      });
      req.flash('success', 'Listing updated successfully!');
      res.redirect('/listings');
    } catch (err) {
      console.error('Failed to update listing', err);
      res.status(500).send('Failed to update listing');
    }
  });

router.route('/deleteListing/:id')
  .post(isLoggedIn, isOwner, async (req, res) => {
    try {
      const listing = await Listing.findById(req.params.id);
      if (listing) {
        // Delete all reviews related to this listing
        await Review.deleteMany({ _id: { $in: listing.reviews } });
        // Delete the listing
        await Listing.findByIdAndDelete(req.params.id);
      }
      req.flash('success', 'Listing deleted successfully!');
      res.redirect('/listings');
    } catch (err) {
      console.error('Failed to delete listing', err);
      res.status(500).send('Failed to delete listing');
    }
  });

router.get('/test-cloudinary-upload', isLoggedIn, async (req, res) => {
  req.flash('error', 'Image upload service is no longer available.');
  res.redirect('/listings');
});

export default router;
