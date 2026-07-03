const Message = require('../models/Message');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, listingId, content } = req.body;

    if (!receiverId || !listingId || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      listing: listingId,
      content
    });

    const populatedMessage = await Message.findById(message._id).populate('sender', 'name').populate('receiver', 'name');
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages for a listing
// @route   GET /api/messages/:listingId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      listing: req.params.listingId,
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    }).populate('sender', 'name').populate('receiver', 'name').sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages
};
