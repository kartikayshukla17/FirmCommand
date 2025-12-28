import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    role: {
        type: String,
        enum: ['Lead', 'Associate'],
        required: true
    },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }, // Link to Org
    status: { type: String, enum: ['Active', 'Pending', 'Pending_OTP'], default: 'Pending' },
    is_active: { type: Boolean, default: true },
    otp: String,
    otpExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    tokenVersion: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
