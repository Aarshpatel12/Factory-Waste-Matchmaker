const Listing = require('../models/Listing');
const User = require('../models/User');

// @desc    Get analytics summary
// @route   GET /api/analytics
// @access  Private (Admin only)
const getAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    // 1. Total waste diverted (count of claimed items)
    const claimedListingsCount = await Listing.countDocuments({ status: 'Claimed' });

    // Since we don't have purely numeric weight field (quantity is a string like "50 kg"),
    // we'll use the number of diverted transactions as the primary metric.
    // If quantity was standardized to purely numbers, we could $sum it.

    // 2. Category Breakdown
    const categoryBreakdown = await Listing.aggregate([
      { $match: { status: 'Claimed' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]);

    // 3. Number of active businesses
    const totalGenerators = await User.countDocuments({ role: 'generator' });
    const totalRecyclers = await User.countDocuments({ role: 'recycler' });

    res.status(200).json({
      claimedItems: claimedListingsCount,
      categoryBreakdown,
      businesses: {
        generators: totalGenerators,
        recyclers: totalRecyclers,
        total: totalGenerators + totalRecyclers
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAnalytics
};
