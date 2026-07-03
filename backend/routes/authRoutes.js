const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, toggleFavorite, getImpactStats, getLeaderboard, googleLogin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.put('/favorites/:listingId', protect, toggleFavorite);
router.get('/impact-stats', protect, getImpactStats);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
