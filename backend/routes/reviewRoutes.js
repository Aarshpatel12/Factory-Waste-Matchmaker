const express = require('express');
const router = express.Router();
const { createReview, getGeneratorReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/generator/:id', getGeneratorReviews);

module.exports = router;
