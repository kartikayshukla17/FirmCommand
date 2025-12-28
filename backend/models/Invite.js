import mongoose from 'mongoose';

const inviteSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    is_used: {
        type: Boolean,
        default: false
    },
    used_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, { timestamps: true });

export default mongoose.model('Invite', inviteSchema);
