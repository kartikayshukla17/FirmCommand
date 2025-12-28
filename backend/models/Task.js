import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    type: {
        type: String,
        enum: ['Registry', 'Custom', 'Payment', 'Corporate'],
        default: 'Custom'
    },
    property_filters: {
        builder: { type: String }, // e.g. "Gaursons", "ATS"
        property_type: { type: String, enum: ['Residential', 'Commercial', 'Industrial', 'Land'] },
        category: { type: String, enum: ['Flat', 'Plot', 'Villa', 'Shop'] },
        sector: { type: String } // e.g. "Sector 150"
    },
    micro_tasks: [{
        title: String,
        is_done: { type: Boolean, default: false }
    }],
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Under Review', 'Completed', 'Rejected'],
        default: 'Pending'
    },
    assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assigned_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },


    // Submission
    proof_of_work: { type: String }, // URL or text description

    // Timestamps for tracking
    started_at: { type: Date },
    submitted_at: { type: Date },
    completed_at: { type: Date },

    // Full tracking
    audit_log: [{
        action: String, // "Assigned", "Submitted", "Rejected", "Approved"
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        by_name: String, // Snapshot of name in case user is deleted
        timestamp: { type: Date, default: Date.now },
        details: String // "Reason for rejection: xyz"
    }]
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
