const Listing = require('../models/Listing');
const User = require('../models/User');

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private (Generator only)
const createListing = async (req, res) => {
  try {
    if (req.user.role !== 'generator') {
      return res.status(403).json({ message: 'Only generators can create listings' });
    }

    const { title, category, quantity, description, location, image } = req.body;

    if (!title || !category || !quantity || !description || !location) {
        return res.status(400).json({ message: 'Please add all required fields' });
    }

    const listing = await Listing.create({
      title,
      category,
      quantity,
      description,
      location,
      image,
      generator: req.user.id
    });

    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all active listings
// @route   GET /api/listings
// @access  Private
const getListings = async (req, res) => {
  try {
    const { category } = req.query;
    let query = { status: 'Available' };
    
    if (category && category !== 'All') {
        query.category = category;
    }

    // Populate generator info including rating
    const listings = await Listing.find(query)
        .populate('generator', 'name averageRating numReviews email')
        .sort({ createdAt: -1 });

    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get listings created by the logged-in generator
// @route   GET /api/listings/my-listings
// @access  Private (Generator only)
const getMyListings = async (req, res) => {
  try {
    if (req.user.role !== 'generator') {
      return res.status(403).json({ message: 'Only generators can view their listings this way' });
    }

    const listings = await Listing.find({ generator: req.user.id })
      .populate('claimedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Claim a listing
// @route   PUT /api/listings/:id/claim
// @access  Private (Recycler only)
const claimListing = async (req, res) => {
  try {
    if (req.user.role !== 'recycler') {
      return res.status(403).json({ message: 'Only recyclers can claim listings' });
    }

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.status === 'Claimed') {
      return res.status(400).json({ message: 'Listing is already claimed' });
    }

    listing.status = 'Claimed';
    listing.claimedBy = req.user.id;
    await listing.save();

    // Fetch again and populate generator's contact info and rating
    const claimedListing = await Listing.findById(req.params.id)
        .populate('generator', 'name email averageRating numReviews'); 

    res.status(200).json(claimedListing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createListing,
  getListings,
  getMyListings,
  claimListing
};
