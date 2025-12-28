import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import mongoose from 'mongoose';
import { protect, leadOnly } from '../middleware/authMiddleware.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';

import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

// Generate JWT
const generateToken = (id, version = 0) => {
    return jwt.sign({ id, tokenVersion: version }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Check if system needs setup (0 users)
// @route   GET /api/auth/status
// @access  Public
router.get('/status', asyncHandler(async (req, res) => {
    const count = await User.countDocuments();
    res.json({ needsSetup: count === 0 });
}));

// @desc    Initialize System (Create First Boss)
// @route   POST /api/auth/setup
// @access  Public (Only if 0 users)
router.post('/setup', asyncHandler(async (req, res, next) => {
    const count = await User.countDocuments();
    if (count > 0) {
        return next(new ErrorResponse('System already initialized', 403));
    }

    const { username, email, password } = req.body;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        username,
        email,
        password_hash: hashedPassword,
        role: 'Lead', // First user is always Lead
        created_by: null
    });

    res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
    });
}));

// @desc    Authenticate User & Get Token
// @route   POST /api/auth/login
// @access  Public
// @desc    Authenticate User & Get Token
// @route   POST /api/auth/login
// @access  Public
// @desc    Register a new User (Create Org or Join Org)
// @route   POST /api/auth/register
// @access  Public
router.post('/register', asyncHandler(async (req, res, next) => {
    // Mode: "create" or "join"
    const { mode, username, email, password, role, orgName, orgCode } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return next(new ErrorResponse('User already exists', 400));
    }

    let organization;
    let userRole = role;
    let userStatus = 'Pending'; // Default
    let newOrg = null;

    if (mode === 'create') {
        // Create Organization Logic (Only Lead can create)
        if (!orgName) return next(new ErrorResponse('Organization Name is required', 400));

        // Check Org Name uniqueness
        const orgExists = await Organization.findOne({ name: orgName });
        if (orgExists) return next(new ErrorResponse('Organization Name already taken', 400));

        // Generate Code (16 chars)
        const generatedCode = crypto.randomBytes(8).toString('hex').toUpperCase();

        // Create Org (Owner set later)
        newOrg = await Organization.create({
            name: orgName,
            code: generatedCode,
            owner: new mongoose.Types.ObjectId() // Placeholder, updated below
        });

        organization = newOrg;
        userRole = 'Lead';
        userStatus = 'Active'; // Creator is always active
    } else if (mode === 'join') {
        // Join Organization Logic
        if (!orgCode) return next(new ErrorResponse('Organization Code is required', 400));

        organization = await Organization.findOne({ code: orgCode });
        if (!organization) return next(new ErrorResponse('Invalid Organization Code', 404));

        // Role is selected by user (Lead or Associate)
        if (!['Lead', 'Associate'].includes(role)) {
            return next(new ErrorResponse('Invalid Role', 400));
        }
    } else {
        return next(new ErrorResponse('Invalid registration mode', 400));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Initial Status for Lead is Pending_OTP
    if (userRole === 'Lead') {
        userStatus = 'Pending_OTP';
    }

    const user = await User.create({
        username,
        email,
        password_hash: hashedPassword,
        role: userRole,
        organization: organization._id,
        status: userStatus
    });

    // If created org, update owner to this user
    if (newOrg) {
        newOrg.owner = user._id;
        await newOrg.save();
    }

    // If joining, create JoinRequest
    if (mode === 'join') {
        const JoinRequest = (await import('../models/JoinRequest.js')).default;
        await JoinRequest.create({
            user: user._id,
            organization: organization._id,
            role: userRole,
            status: 'Pending'
        });
    }

    // If Lead, Send OTP
    if (userRole === 'Lead') {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
        await user.save();

        try {
            await sendEmail({
                email: user.email,
                subject: 'Task Manager - Verify Your Account (OTP)',
                message: `Your OTP for account verification is: ${otp}. It expires in 10 minutes.`
            });
            return res.status(201).json({
                requireOtp: true,
                tempId: user._id,
                email: user.email,
                message: 'OTP sent to email',
                debugOtp: otp // <--- Exposed for UI
            });
        } catch (error) {
            console.error(error);
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            return next(new ErrorResponse('Email could not be sent', 500));
        }
    }

    // Response
    if (userStatus === 'Active') {
        // Set Cookie
        res.cookie('token', generateToken(user._id, user.tokenVersion), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(201).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            organization: organization._id,
            orgCode: organization.code
        });
    } else {
        res.status(201).json({
            message: 'Registration successful. Waiting for approval.',
            status: 'Pending'
        });
    }
}));

// @desc    Authenticate User & Get Token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('organization');

    if (user && (await bcrypt.compare(password, user.password_hash))) {
        if (user.status === 'Pending') {
            return next(new ErrorResponse('Account is pending approval from an administrator.', 403));
        }

        // Auto-Migrate Legacy Roles
        if (user.role === 'Boss') {
            user.role = 'Lead';
            // Wait for next save to persist this change
        } else if (user.role === 'Worker') {
            user.role = 'Associate';
        }

        // OTP Logic for Lead (or Boss)
        if (['Lead', 'Boss'].includes(user.role)) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.otp = otp;
            user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
            await user.save();

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Task Manager - Login OTP',
                    message: `Your OTP for login is: ${otp}. It expires in 10 minutes.`
                });
                // Return OTP in response for development/demo purposes
                return res.json({
                    requireOtp: true,
                    tempId: user._id,
                    debugOtp: otp // <--- Exposed for UI
                });
            } catch (err) {
                return next(new ErrorResponse('Email could not be sent', 500));
            }
        }

        // Login Alert for Associate (or Worker)
        if (['Associate', 'Worker'].includes(user.role)) {
            const token = generateToken(user._id, user.tokenVersion);
            const signoutLink = `${req.protocol}://${req.get('host')}/api/auth/remote-signout/${user._id}/${token}`;

            try {
                // Async email (don't await to not block login)
                sendEmail({
                    email: user.email,
                    subject: 'New Login Alert',
                    html: `<p>New login detected. If this wasn't you, click here to sign out all sessions: <a href="${signoutLink}">Remote Sign Out</a></p>`
                }).catch(console.error);
            } catch (ignored) { }

            // Set Cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });

            return res.json({
                _id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                organization: user.organization?._id || null,
                orgCode: user.organization?.code || null,
                orgName: user.organization?.name || null
            });
        }

        // Fallback for unknown roles
        return next(new ErrorResponse('Role not recognized', 400));
    } else {
        return next(new ErrorResponse('Invalid email or password', 401));
    }
}));

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    // Explicitly populate organization if not already done by middleware
    await req.user.populate('organization');

    res.json({
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        organization: req.user.organization?._id || null,
        orgCode: req.user.organization?.code || null,
        orgName: req.user.organization?.name || null
    });
});

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private (Boss Only)
// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private (Lead Only)
router.get('/users', protect, leadOnly, asyncHandler(async (req, res) => {
    const users = await User.find({ organization: req.user.organization }, '-password_hash').sort({ createdAt: -1 });
    res.json(users);
}));

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private (Boss Only)
// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private (Lead Only)
router.delete('/users/:id', protect, leadOnly, asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    if (user.role === 'Lead') {
        return next(new ErrorResponse('Cannot delete a Lead account', 403));
    }

    await user.deleteOne();
    res.json({ message: 'User removed' });
}));

// @desc    Verify OTP (Signup or Login)
// @route   POST /api/auth/verify-otp
router.post('/verify-otp', asyncHandler(async (req, res, next) => {
    const { userId, otp } = req.body;
    const user = await User.findById(userId).populate('organization');

    if (!user) return next(new ErrorResponse('User not found', 404));

    if (user.otp !== otp || user.otpExpires < Date.now()) {
        return next(new ErrorResponse('Invalid or expired OTP', 400));
    }

    // OTP Verified
    user.otp = undefined;
    user.otpExpires = undefined;
    if (user.status === 'Pending_OTP') {
        user.status = 'Active';
    }
    await user.save();

    // Set Cookie
    res.cookie('token', generateToken(user._id, user.tokenVersion), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        organization: user.organization._id,
        orgCode: user.organization.code
    });
}));

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
router.post('/forgot-password', asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(new ErrorResponse('There is no user with that email', 404));

    // Get reset token (raw)
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save();

    const resetUrl = `${req.protocol}://localhost:5173/reset-password/${resetToken}`; // Adjust frontend URL

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click: \n\n <a href="${resetUrl}">${resetUrl}</a>`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Token',
            html: message
        });

        res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
        console.error(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        return next(new ErrorResponse('Email could not be sent', 500));
    }
}));

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:resetToken
router.put('/reset-password/:resetToken', asyncHandler(async (req, res, next) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorResponse('Invalid token', 400));
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(req.body.password, salt);

    // Clear reset fields & invalidate old sessions
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.tokenVersion += 1;

    await user.save();

    res.status(200).json({ success: true, data: 'Password updated' });
}));

// @desc    Remote Signout
// @route   GET /api/auth/remote-signout/:id/:token
router.get('/remote-signout/:id/:token', asyncHandler(async (req, res, next) => {
    const { id, token } = req.params;

    // Verify token roughly (or just trust the ID/Token if signed)
    // Actually we should verify JWT signature to be safe
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.id !== id) throw new Error();
    } catch (e) {
        return res.status(400).send("Invalid link");
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).send("User not found");

    user.tokenVersion += 1;
    await user.save();

    res.send("<h1>Successfully signed out all sessions.</h1><p>You can verify by refreshing your app.</p>");
}));

// @desc    Logout User / Clear Cookie
// @route   POST /api/auth/logout
// @access  Public
router.post('/logout', (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Generate OTP for Exit
// @route   POST /api/auth/exit-otp
// @access  Private
router.post('/exit-otp', protect, asyncHandler(async (req, res, next) => {
    const user = req.user;

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    try {
        await sendEmail({
            email: user.email,
            subject: 'Task Manager - Conserve Exit OTP',
            message: `Your OTP to exit the organization is: ${otp}. It expires in 10 minutes.`
        });

        res.json({ message: 'OTP sent to email', email: user.email });
    } catch (err) {
        console.error(err);
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        return next(new ErrorResponse('Email could not be sent', 500));
    }
}));

// @desc    Verify OTP & Process Exit
// @route   POST /api/auth/exit-verify
// @access  Private
router.post('/exit-verify', protect, asyncHandler(async (req, res, next) => {
    const { otp } = req.body;
    const user = req.user;

    // Verify OTP
    if (user.otp !== otp || user.otpExpires < Date.now()) {
        return next(new ErrorResponse('Invalid or expired OTP', 400));
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // LEAD EXIT LOGIC
    if (user.role === 'Lead') {
        const Organization = (await import('../models/Organization.js')).default;
        const Task = (await import('../models/Task.js')).default;

        // Check ownership
        const org = await Organization.findOne({ owner: user._id });
        if (org) {
            // Check if there are other bosses
            const otherLead = await User.findOne({
                organization: org._id,
                role: 'Lead',
                _id: { $ne: user._id }
            }).sort({ createdAt: 1 }); // Oldest boss first

            if (otherLead) {
                // Transfer ownership
                org.owner = otherLead._id;
                await org.save();

                // Exiting lead leaves
                user.organization = undefined;
                await user.save();

                return res.json({
                    message: `Ownership transferred to ${otherLead.username}. You have exited successfully.`,
                    status: 'Exited'
                });
            } else {
                // Dissolve Organization (No other leads)
                await Task.deleteMany({ organization: org._id }); // Delete all org tasks
                await User.updateMany(
                    { organization: org._id },
                    { $unset: { organization: 1 } } // Free all workers
                );
                await Organization.findByIdAndDelete(org._id); // Delete Org
            }
        }

        // Remove Lead from Org
        user.organization = undefined;
        await user.save();

        return res.json({ message: 'Organization dissolved. You have exited successfully.', status: 'Exited' });
    }

    // ASSOCIATE EXIT LOGIC
    // Dynamic import to avoid circular dependency if Task imports User/Auth
    const Task = (await import('../models/Task.js')).default;

    // Active tasks: Assigned to user AND status is not Completed or Rejected
    const activeTasks = await Task.countDocuments({
        assigned_to: user._id,
        status: { $nin: ['Completed', 'Rejected'] }
    });

    if (activeTasks === 0) {
        // Clean Exit
        await Task.deleteMany({ assigned_to: user._id }); // Delete ALL tasks (active, completed, rejected)
        user.organization = undefined; // Remove Org Link
        await user.save();
        res.json({ message: 'Exited successfully', status: 'Exited' });
    } else {
        // Dirty Exit needs verification
        const ExitRequest = (await import('../models/ExitRequest.js')).default;

        // Check if request already exists
        const existingRequest = await ExitRequest.findOne({
            user: user._id,
            organization: user.organization,
            status: 'Pending'
        });

        if (!existingRequest) {
            await ExitRequest.create({
                user: user._id,
                organization: user.organization,
                status: 'Pending'
            });
        }

        res.json({
            message: `You have ${activeTasks} active tasks. An exit request has been sent to your Lead for approval.`,
            status: 'Pending',
            activeTasks
        });
    }
}));

export default router;
