import express from 'express';
import Task from '../models/Task.js';
// import Builder from '../models/Builder.js';
import { protect, leadOnly } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();

// @desc    Get All Tasks (Filtered)
// @route   GET /api/tasks
// @access  Private (Lead=All, Associate=Mine)
router.get('/', protect, asyncHandler(async (req, res) => {
    const { status, type, builder } = req.query;
    let query = {
        organization: req.user.organization // Strict Isolation
    };

    // Role Logic
    if (req.user.role === 'Associate') {
        query.assigned_to = req.user._id;
    }

    // Filters
    if (status) query.status = status;
    if (type) query.type = type;
    if (builder) query['property_filters.builder'] = builder;

    const tasks = await Task.find(query)
        .populate('assigned_to', 'username')
        .populate('assigned_by', 'username')
        .sort({ createdAt: -1 });

    res.json(tasks);
}));

// @desc    Create a Task
// @route   POST /api/tasks
// @access  Private (Lead Only)
router.post('/', protect, leadOnly, asyncHandler(async (req, res) => {
    const {
        title, description, type,
        property_filters, assigned_to,
        micro_tasks
    } = req.body;

    // Sanitize property_filters to remove empty strings
    const sanitizedFilters = {};
    if (property_filters) {
        if (property_filters.builder) sanitizedFilters.builder = property_filters.builder;
        if (property_filters.property_type) sanitizedFilters.property_type = property_filters.property_type;
        if (property_filters.category) sanitizedFilters.category = property_filters.category;
        if (property_filters.sector) sanitizedFilters.sector = property_filters.sector;
    }

    const task = await Task.create({
        title,
        description,
        type,
        property_filters: sanitizedFilters,
        assigned_to: assigned_to || undefined, // Handle empty string for ObjectId
        assigned_by: req.user._id,
        organization: req.user.organization, // Auto-assign to current Org
        micro_tasks: micro_tasks || [],
        audit_log: [{
            action: 'Created',
            by: req.user._id,
            by_name: req.user.username,
            details: 'Task created'
        }]
    });

    // Notify Assigned Associate
    if (assigned_to) {
        const { sendNotification } = await import('../utils/socket.js');
        await sendNotification(
            assigned_to,
            'New Task Assigned',
            `You have been assigned a new task: ${title}`,
            'info',
            { taskId: task._id, type: 'task_assigned' }
        );
    }

    res.status(201).json(task);
}));

import File from '../models/File.js';

// ... (other imports)

// @desc    Upload file for task (Save to MongoDB)
// @route   POST /api/tasks/upload
// @access  Private
router.post('/upload', protect, upload.single('file'), asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new ErrorResponse('No file uploaded', 400));
    }

    // Save to MongoDB
    const newFile = await File.create({
        user: req.user._id,
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        size: req.file.size,
        data: req.file.buffer
    });

    // Return the API URL to fetch this file
    const fileUrl = `/api/tasks/files/${newFile._id}`;
    res.json({ fileUrl, filename: req.file.originalname });
}));

// @desc    Get File by ID
// @route   GET /api/tasks/files/:id
// @access  Private (or Public if using signed URLs, but Private for now)
router.get('/files/:id', asyncHandler(async (req, res, next) => {
    const file = await File.findById(req.params.id);

    if (!file) {
        return next(new ErrorResponse('File not found', 404));
    }

    // Set headers
    res.set('Content-Type', file.contentType);
    res.set('Content-Disposition', `inline; filename="${file.filename}"`); // 'inline' to view in browser

    // Send buffer
    res.send(file.data);
}));

// @desc    Update Task (Associate/Lead)
// @route   PATCH /api/tasks/:id
// @access  Private
// Used for: Submitting proof, updating micro-tasks
router.patch('/:id', protect, asyncHandler(async (req, res, next) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        return next(new ErrorResponse('Task not found', 404));
    }

    // Permission check
    if (req.user.role !== 'Lead' && task.assigned_to.toString() !== req.user._id.toString()) {
        return next(new ErrorResponse('Not authorized', 401));
    }

    const {
        proof_of_work, micro_tasks, status,
        // Lead update fields
        title, description, type, assigned_to, property_filters
    } = req.body;

    // Logic: Lead full update
    if (req.user.role === 'Lead') {
        if (title) task.title = title;
        if (description) task.description = description;
        if (type) task.type = type;
        if (assigned_to) task.assigned_to = assigned_to;

        // Handle property_filters update safely
        if (property_filters) {
            // Sanitize filters (same as Create)
            const sanitizedFilters = { ...task.property_filters }; // Start with existing
            if (property_filters.builder !== undefined) sanitizedFilters.builder = property_filters.builder;
            if (property_filters.property_type !== undefined) sanitizedFilters.property_type = property_filters.property_type || undefined;
            if (property_filters.category !== undefined) sanitizedFilters.category = property_filters.category || undefined;
            if (property_filters.sector !== undefined) sanitizedFilters.sector = property_filters.sector;

            task.property_filters = sanitizedFilters;
        }

        // Lead Manual Status Update
        if (status) {
            task.status = status;
            if (status === 'Completed') {
                task.completed_at = new Date();
                task.audit_log.push({
                    action: 'Completed',
                    by: req.user._id,
                    by_name: req.user.username,
                    details: 'Manually marked as completed by Lead'
                });
            } else if (status === 'In Progress' && !task.started_at) {
                task.started_at = new Date();
            }
        }
    }

    // Logic: If submitting proof
    if (proof_of_work) {
        task.proof_of_work = proof_of_work;
        task.status = 'Under Review';
        task.submitted_at = new Date();
        task.audit_log.push({
            action: 'Submitted',
            by: req.user._id,
            by_name: req.user.username,
            details: 'Proof submitted'
        });

        // Notify Lead
        const { sendNotification } = await import('../utils/socket.js');
        await sendNotification(
            task.assigned_by,
            'Task Submitted',
            `${req.user.username} submitted proof for: ${task.title}`,
            'info',
            { taskId: task._id, type: 'task_submitted' }
        );
    }

    // Logic: Update microtasks
    if (micro_tasks) {
        task.micro_tasks = micro_tasks;
    }

    // Explicit status change (if allowed)
    if (status) {
        // Track when task is started
        if (status === 'In Progress' && !task.started_at) {
            task.started_at = new Date();
        }

        task.status = status;
    }

    await task.save();
    res.json(task);
}));

// @desc    Review Task (Accept/Reject)
// @route   PATCH /api/tasks/:id/review
// @access  Private (Lead Only)
router.patch('/:id/review', protect, leadOnly, asyncHandler(async (req, res, next) => {
    const { decision, reason } = req.body; // decision: 'approve' or 'reject'
    const task = await Task.findById(req.params.id);

    if (!task) return next(new ErrorResponse('Task not found', 404));

    if (decision === 'approve') {
        task.status = 'Completed';
        task.completed_at = new Date();
        task.audit_log.push({
            action: 'Approved',
            by: req.user._id,
            by_name: req.user.username,
            details: reason || 'Task approved'
        });

        // Notify Associate
        const { sendNotification } = await import('../utils/socket.js');
        await sendNotification(
            task.assigned_to,
            'Task Approved',
            `Your work for "${task.title}" has been approved!`,
            'success',
            { taskId: task._id, type: 'task_approved' }
        );
    } else if (decision === 'reject') {
        task.status = 'Rejected'; // Or 'In Progress' to retry
        task.audit_log.push({
            action: 'Rejected',
            by: req.user._id,
            by_name: req.user.username,
            details: reason || 'Task rejected'
        });

        // Notify Associate
        const { sendNotification } = await import('../utils/socket.js');
        await sendNotification(
            task.assigned_to,
            'Task Rejected',
            `Your work for "${task.title}" was rejected. Reason: ${reason || 'No reason provided'}`,
            'warning',
            { taskId: task._id, type: 'task_rejected' }
        );
    }

    await task.save();
    res.json(task);
}));

/*
// @desc    Get All Builders
// @route   GET /api/tasks/builders
// @access  Private
router.get('/builders/list', protect, asyncHandler(async (req, res) => {
    const builders = await Builder.find().sort({ name: 1 });
    res.json(builders);
}));

// @desc    Seed Builders (One time)
// @route   POST /api/tasks/builders/seed
// @access  Private (Boss Only)
router.post('/builders/seed', protect, leadOnly, asyncHandler(async (req, res) => {
    const delhiBuilders = [
        { name: 'Gaursons India', city: 'Noida' },
        { name: 'ATS Infrastructure', city: 'Noida' },
        { name: 'DLF Limited', city: 'Gurgaon' },
        { name: 'Jaypee Group', city: 'Noida' },
        { name: 'Supertech Limited', city: 'Noida' },
        { name: 'Omaxe Ltd', city: 'Delhi' },
        { name: 'Mahagun Group', city: 'Noida' },
        { name: 'Gulshan Homz', city: 'Noida' },
        { name: 'Godrej Properties', city: 'Noida' },
        { name: 'Tata Housing', city: 'Gurgaon' },
        { name: 'Ace Group', city: 'Noida' },
        { name: 'Logix Group', city: 'Noida' },
        { name: 'Bhutani Infra', city: 'Noida' },
        { name: 'Paras Buildtech', city: 'Noida' },
        { name: 'Amrapali Group', city: 'Noida' }
    ];

    await Builder.deleteMany({}); // Clear old
    await Builder.insertMany(delhiBuilders);
    res.json({ message: 'Builders Seeded', count: delhiBuilders.length });
}));
*/

export default router;
