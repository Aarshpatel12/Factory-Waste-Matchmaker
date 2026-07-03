const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  category: {
    type: String,
    enum: ['Textiles', 'Metal Shavings', 'Wood', 'Plastics', 'E-Waste', 'Other'],
    required: [true, 'Please select a category']
  },
  quantity: {
    type: String,
    required: [true, 'Please add a quantity (e.g. 50 kg)']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  location: {
    type: String,
    required: [true, 'Please add a pickup location or PIN code']
  },
  image: {
    type: String, // Will store Base64 encoded image string
    required: false
  },
  status: {
    type: String,
    enum: ['Available', 'Claimed'],
    default: 'Available'
  },
  generator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;
