import express from 'express';
import crypto from 'crypto';
import Invite from '../models/Invite.js';
import { protect, leadOnly } from '../middleware/authMiddleware.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();

// @desc    Generate an Invite Token
// @route   POST /api/invites/generate
// @access  Private (Boss Only)
router.post('/generate', protect, leadOnly, asyncHandler(async (req, res) => {
    // Generate simple random token
    const token = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars like "AB12CD"

    const invite = await Invite.create({
        token,
        created_by: req.user._id
    });

    res.status(201).json({
        success: true,
        token: invite.token
    });
}));

export default router;
