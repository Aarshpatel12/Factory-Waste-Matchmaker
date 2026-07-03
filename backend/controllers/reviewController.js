const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Recycler only)
const createReview = async (req, res) => {
  try {
    if (req.user.role !== 'recycler') {
      return res.status(403).json({ message: 'Only recyclers can leave reviews' });
    }

    const { rating, comment, generatorId, listingId } = req.body;

    if (!rating || !generatorId || !listingId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if review already exists for this listing
    const alreadyReviewed = await Review.findOne({ reviewer: req.user.id, listing: listingId });
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this listing' });
    }

    const review = await Review.create({
      rating: Number(rating),
      comment,
      reviewer: req.user.id,
      generator: generatorId,
      listing: listingId
    });

    // Update Generator's average rating
    const reviews = await Review.find({ generator: generatorId });
    const numReviews = reviews.length;
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

    await User.findByIdAndUpdate(generatorId, {
      averageRating: avgRating,
      numReviews: numReviews
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews for a specific generator
// @route   GET /api/reviews/generator/:id
// @access  Public
const getGeneratorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ generator: req.params.id }).populate('reviewer', 'name');
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getGeneratorReviews
};
