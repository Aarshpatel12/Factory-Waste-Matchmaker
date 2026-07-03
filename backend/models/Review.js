const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: false
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  generator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Listing'
  }
}, {
  timestamps: true
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
