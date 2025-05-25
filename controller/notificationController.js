const Notification = require('../models/Notification');

// Get all notifications
exports.getNotifications = async (req, res) => {
    try {
        let { page, limit, read } = req.query;

        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;

        const skip = (page - 1) * limit;

        const filter = {};

        // Filter by read status if provided
        if (read === 'true') {
            filter.read = true;
        } else if (read === 'false') {
            filter.read = false;
        }

        const notifications = await Notification.find(filter)
            .populate('relatedTo')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Notification.countDocuments(filter);
        const unreadCount = await Notification.countDocuments({ read: false });

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            data: notifications,
            unreadCount,
            pagination: {
                total,
                page,
                limit,
                totalPages
            }
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
            error: error.message
        });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findById(id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        notification.read = true;
        await notification.save();

        res.status(200).json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
            error: error.message
        });
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({}, { read: true });

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read',
            error: error.message
        });
    }
};

// Get unread notifications count
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ read: false });

        res.status(200).json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Error getting unread notifications count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unread notifications count',
            error: error.message
        });
    }
};