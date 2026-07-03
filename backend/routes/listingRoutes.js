const express = require('express');
const router = express.Router();
const { createListing, getListings, getMyListings, claimListing } = require('../controllers/listingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createListing)
  .get(protect, getListings);

router.get('/my-listings', protect, getMyListings);
router.put('/:id/claim', protect, claimListing);

module.exports = router;
