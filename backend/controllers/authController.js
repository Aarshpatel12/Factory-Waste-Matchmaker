const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    if (!['generator', 'recycler', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('favorites');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle favorite listing
// @route   PUT /api/auth/favorites/:listingId
// @access  Private
const toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const listingId = req.params.listingId;

    if (user.favorites.includes(listingId)) {
      user.favorites = user.favorites.filter(id => id.toString() !== listingId);
    } else {
      user.favorites.push(listingId);
    }

    await user.save();
    res.status(200).json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user impact stats
// @route   GET /api/auth/impact-stats
// @access  Private
const getImpactStats = async (req, res) => {
  try {
    const Listing = require('../models/Listing'); // required here or globally
    let divertedCount = 0;
    if (req.user.role === 'recycler') {
      divertedCount = await Listing.countDocuments({ claimedBy: req.user.id });
    } else if (req.user.role === 'generator') {
      divertedCount = await Listing.countDocuments({ generator: req.user.id, status: 'Claimed' });
    }
    res.status(200).json({ divertedCount, role: req.user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get public sustainability leaderboard
// @route   GET /api/auth/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
  try {
    const topGenerators = await User.find({ role: 'generator', numReviews: { $gt: 0 } })
      .select('name averageRating numReviews')
      .sort({ averageRating: -1, numReviews: -1 })
      .limit(10);
    res.status(200).json(topGenerators);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    // We use a placeholder client ID for the demo.
    // IN PRODUCTION: Move this to process.env.GOOGLE_CLIENT_ID
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
    
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    
    // In a real scenario with a valid Client ID, we would verify the token:
    // const ticket = await client.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID });
    // const payload = ticket.getPayload();
    // const { email, name } = payload;
    
    // For this demo since the user hasn't provided a real Client ID yet,
    // we'll bypass actual verification to prevent crashing and just decode the JWT manually.
    // DO NOT DO THIS IN PRODUCTION!
    const jwtDecode = require('jwt-decode');
    let decoded;
    try {
      decoded = jwtDecode.jwtDecode ? jwtDecode.jwtDecode(token) : require('jwt-decode')(token);
    } catch(e) {
      // Fallback rough decode for demo if jwt-decode isn't available
      decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    }
    
    const { email, name } = decoded;

    let user = await User.findOne({ email });

    if (!user) {
      // Create user with default 'recycler' role and a random password
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), salt);

      user = await User.create({
        name,
        email,
        password: randomPassword,
        role: 'recycler' // Default role for new Google signups
      });
    }

    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  toggleFavorite,
  getImpactStats,
  getLeaderboard,
  googleLogin
};
