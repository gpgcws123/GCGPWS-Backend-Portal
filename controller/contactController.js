const Contact = require('../models/Contact');
const { successResponse, errorResponse } = require('../utlies/responseHandler');
const { sendContactReplyEmail } = require('../utlies/emailService');

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

// Update a message content (admin edit)
exports.updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return errorResponse(res, 'Message is required', 400);
    }

    const updated = await Contact.findByIdAndUpdate(
      id,
      { message: message.trim() },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return errorResponse(res, 'Message not found', 404);
    }

    return successResponse(res, 'Message updated successfully', updated);
  } catch (error) {
    console.error('Error updating contact message:', error);
    return errorResponse(res, 'Failed to update message', 500);
  }
};

// Reply to a contact message (send email and store reply)
exports.replyToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply, subject } = req.body;

    if (!reply || !reply.trim()) {
      return errorResponse(res, 'Reply text is required', 400);
    }

    const contact = await Contact.findById(id);
    if (!contact) {
      return errorResponse(res, 'Message not found', 404);
    }

    // Send email
    const emailSent = await sendContactReplyEmail(contact.email, {
      name: contact.name,
      reply: reply.trim(),
      subject: subject && subject.trim() ? subject.trim() : undefined
    });

    if (!emailSent) {
      return errorResponse(res, 'Failed to send email reply', 500);
    }

    // Save reply and mark as read
    contact.replies = contact.replies || [];
    contact.replies.push({
      message: reply.trim(),
      repliedBy: (req.user && (req.user.email || req.user.uid)) || 'admin'
    });
    contact.read = true;
    await contact.save();

    return successResponse(res, 'Reply sent and saved', contact);
  } catch (error) {
    console.error('Error replying to contact message:', error);
    return errorResponse(res, 'Failed to send reply', 500);
  }
};
