import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/authMiddleware.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();

// @desc    Get User Notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50); // Limit to last 50
    res.json(notifications);
}));

// @desc    Mark Notification as Read
// @route   PATCH /api/notifications/:id/read
// @access  Private
router.patch('/:id/read', protect, asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (notification && notification.user.toString() === req.user._id.toString()) {
        notification.read = true;
        await notification.save();
        res.json(notification);
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
}));

// @desc    Mark ALL as Read
// @route   PATCH /api/notifications/read-all
// @access  Private
router.patch('/read-all', protect, asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { user: req.user._id, read: false },
        { $set: { read: true } }
    );
    res.json({ message: 'All notifications marked as read' });
}));

export default router;
