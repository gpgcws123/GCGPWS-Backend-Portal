const Contact = require('../models/Contact');
const { successResponse, errorResponse } = require('../utlies/responseHandler');

// Submit a new contact form
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return errorResponse(res, 'All fields are required', 400);
    }

    // Create new contact entry
    const newContact = new Contact({
      name,
      email,
      message
    });

    // Save to database
    await newContact.save();

    return successResponse(res, 'Message submitted successfully', null);
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return errorResponse(res, 'Failed to submit message', 500);
  }
};

// Get all contact messages (public)
exports.getPublicMessages = async (req, res) => {
  try {
    // Get all messages, sorted by newest first
    const messages = await Contact.find()
      .sort({ createdAt: -1 })
      .select('-__v'); // Exclude version key

    return successResponse(res, 'Messages retrieved successfully', messages);
  } catch (error) {
    console.error('Error fetching public contact messages:', error);
    return errorResponse(res, 'Failed to fetch messages', 500);
  }
};

// Get all contact messages (for admin)
exports.getAllMessages = async (req, res) => {
  try {
    // Get all messages, sorted by newest first
    const messages = await Contact.find()
      .sort({ createdAt: -1 });

    return successResponse(res, 'Messages retrieved successfully', messages);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return errorResponse(res, 'Failed to fetch messages', 500);
  }
};

// Mark a message as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and update the message
    const message = await Contact.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!message) {
      return errorResponse(res, 'Message not found', 404);
    }

    return successResponse(res, 'Message marked as read', message);
  } catch (error) {
    console.error('Error marking message as read:', error);
    return errorResponse(res, 'Failed to update message', 500);
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the message
    const message = await Contact.findByIdAndDelete(id);

    if (!message) {
      return errorResponse(res, 'Message not found', 404);
    }

    return successResponse(res, 'Message deleted successfully', null);
  } catch (error) {
    console.error('Error deleting message:', error);
    return errorResponse(res, 'Failed to delete message', 500);
  }
};

// Get unread messages count (for notification badge)
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Contact.countDocuments({ read: false });
    return successResponse(res, 'Unread count retrieved', { count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    return errorResponse(res, 'Failed to get unread count', 500);
  }
};
