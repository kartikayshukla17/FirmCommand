import express from 'express';
import { protect, leadOnly } from '../middleware/authMiddleware.js';
import JoinRequest from '../models/JoinRequest.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';

const router = express.Router();

// @desc    Get Pending Join Requests
// @route   GET /api/organization/requests
// @access  Private (Lead Only)
router.get('/requests', protect, leadOnly, asyncHandler(async (req, res) => {
    const requests = await JoinRequest.find({
        organization: req.user.organization,
        status: 'Pending'
    })
        .populate('user', 'username email')
        .sort({ createdAt: -1 });

    res.json(requests);
}));

// @desc    Approve Join Request
// @route   POST /api/organization/requests/:id/approve
// @access  Private (Lead Only)
router.post('/requests/:id/approve', protect, leadOnly, asyncHandler(async (req, res, next) => {
    const request = await JoinRequest.findById(req.params.id);

    if (!request) return next(new ErrorResponse('Request not found', 404));

    // Security check: Must belong to lead's org
    if (request.organization.toString() !== req.user.organization.toString()) {
        return next(new ErrorResponse('Not authorized', 403));
    }

    if (request.status !== 'Pending') {
        return next(new ErrorResponse(`Request is already ${request.status}`, 400));
    }

    // Approve
    request.status = 'Approved';
    await request.save();

    // Activate User
    const user = await User.findById(request.user);
    if (user) {
        user.status = 'Active';
        user.organization = request.organization; // FIX: Actually add user to the org
        await user.save();

        // Notify User
        const { sendNotification } = await import('../utils/socket.js');
        await sendNotification(
            user._id,
            'Welcome to the Org!',
            `Your join request has been approved. You are now an active ${request.role}.`,
            'success'
        );
    }

    res.json({ message: 'User approved and activated', request });
}));

// @desc    Reject Join Request
// @route   POST /api/organization/requests/:id/reject
// @access  Private (Lead Only)
router.post('/requests/:id/reject', protect, leadOnly, asyncHandler(async (req, res, next) => {
    const request = await JoinRequest.findById(req.params.id);

    if (!request) return next(new ErrorResponse('Request not found', 404));

    if (request.organization.toString() !== req.user.organization.toString()) {
        return next(new ErrorResponse('Not authorized', 403));
    }

    // Reject
    request.status = 'Rejected';
    await request.save();

    // Ideally, we might delete the user or keep them locked
    // For now, they remain Pending/Rejected status in User? 
    // Let's explicitly keep user status as Pending but effectively they are stuck unless deleted.
    // Or we can delete the user to allow them to try again?
    // User requested "request to join... rejected".

    res.json({ message: 'Request rejected', request });
}));

// @desc    Manually Add User (By Lead)
// @route   POST /api/organization/users
// @access  Private (Lead Only)
router.post('/users', protect, leadOnly, asyncHandler(async (req, res, next) => {
    const { username, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return next(new ErrorResponse('User already exists', 400));
    }

    const salt = await (await import('bcryptjs')).default.genSalt(10);
    const hashedPassword = await (await import('bcryptjs')).default.hash(password, salt);

    const user = await User.create({
        username,
        email,
        password_hash: hashedPassword,
        role: role || 'Associate',
        organization: req.user.organization,
        status: 'Active' // Manually added users are active
    });

    res.status(201).json(user);
}));

// @desc    Join Existing Organization (Free Agent)
// @route   POST /api/organization/join-existing
// @access  Private
router.post('/join-existing', protect, asyncHandler(async (req, res, next) => {
    const { orgCode, role } = req.body;
    const user = req.user;

    // Must be org-less
    if (user.organization) {
        return next(new ErrorResponse('You are already in an organization', 400));
    }

    const organization = await Organization.findOne({ code: orgCode });
    if (!organization) return next(new ErrorResponse('Invalid Organization Code', 404));

    if (!['Lead', 'Associate'].includes(role)) {
        return next(new ErrorResponse('Invalid Role', 400));
    }

    // Check if pending request exists
    const JoinRequest = (await import('../models/JoinRequest.js')).default;
    const existingRequest = await JoinRequest.findOne({
        user: user._id,
        organization: organization._id,
        status: 'Pending'
    });

    if (existingRequest) {
        return next(new ErrorResponse('Join request already pending', 400));
    }

    // Create Request
    await JoinRequest.create({
        user: user._id,
        organization: organization._id,
        role,
        status: 'Pending'
    });

    // Notify Lead
    const { sendNotification } = await import('../utils/socket.js');
    await sendNotification(
        organization.owner,
        'New Join Request',
        `${user.username} requested to join as a ${role}`,
        'info',
        { type: 'join_request', userId: user._id }
    );

    res.json({ message: 'Join request sent to Organization Lead', status: 'Pending' });
}));


// @desc    Get Exit Requests
// @route   GET /api/organization/exit-requests
// @access  Private (Lead)
router.get('/exit-requests', protect, leadOnly, asyncHandler(async (req, res) => {
    const ExitRequest = (await import('../models/ExitRequest.js')).default;
    const requests = await ExitRequest.find({
        organization: req.user.organization,
        status: 'Pending'
    }).populate('user', 'username email');

    res.json(requests);
}));

// @desc    Approve/Reject Exit Request
// @route   PUT /api/organization/exit-requests/:id/decide
// @access  Private (Lead)
router.put('/exit-requests/:id/decide', protect, leadOnly, asyncHandler(async (req, res, next) => {
    const { status } = req.body; // 'Approved' or 'Rejected'
    if (!['Approved', 'Rejected'].includes(status)) {
        return next(new ErrorResponse('Invalid status', 400));
    }

    const ExitRequest = (await import('../models/ExitRequest.js')).default;
    const request = await ExitRequest.findById(req.params.id);

    if (!request) return next(new ErrorResponse('Request not found', 404));

    if (request.organization.toString() !== req.user.organization.toString()) {
        return next(new ErrorResponse('Not authorized', 403));
    }

    request.status = status;
    await request.save();

    if (status === 'Approved') {
        // Free the user
        const User = (await import('../models/User.js')).default;
        const Task = (await import('../models/Task.js')).default;

        const user = await User.findById(request.user);
        if (user) {
            user.organization = undefined;
            await user.save();
        }

        // Delete active tasks (as per request "remove all his tasks")
        await Task.deleteMany({ assigned_to: request.user });

        // Note: The above deletes *all* tasks assigned to the user, including completed ones if they exist.
        // If we strictly wanted only 'active' tasks deleted, we'd filter. 
        // But user said "remove all his tasks". 
        // Given the request context "when user leaves... remove all his tasks", a complete wipe is safer to match intent.
    }

    res.json({ message: `Request ${status}` });
}));

export default router;
