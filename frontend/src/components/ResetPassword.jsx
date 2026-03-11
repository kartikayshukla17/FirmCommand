import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
    const { resetToken } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setMessage('');
        setError('');
        setIsLoading(true);

        try {
            await axios.put(`/api/auth/reset-password/${resetToken}`, { password });
            setMessage('Password reset successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--fc-bg-deep)', fontFamily: 'var(--fc-font-sans)' }}>
            <div className="max-w-md w-full fc-glass p-8 rounded-2xl" style={{ boxShadow: 'var(--fc-shadow-lg)' }}>
                <Link to="/login" className="flex items-center mb-6 text-sm transition-opacity hover:opacity-80" style={{ color: 'var(--fc-text-secondary)', textDecoration: 'none' }}>
                    <ArrowLeft size={16} className="mr-1" /> Back to Login
                </Link>

                <h2 className="fc-serif" style={{ fontSize: '1.875rem', color: 'var(--fc-text-primary)', marginBottom: '0.5rem' }}>Reset Password</h2>
                <p style={{ color: 'var(--fc-text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Enter your new password below.</p>

                {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'var(--fc-danger-dim)', border: '1px solid rgba(229,91,91,0.2)', color: 'var(--fc-danger)' }}>{error}</div>}
                {message && <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'var(--fc-success-dim)', border: '1px solid rgba(52,211,153,0.2)', color: 'var(--fc-success)' }}>{message}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <label className="fc-label">New Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            className="fc-input"
                            style={{ paddingRight: '3rem' }}
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-[34px] transition-opacity hover:opacity-80"
                            style={{ color: 'var(--fc-text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <div className="relative">
                        <label className="fc-label">Confirm Password</label>
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            className="fc-input"
                            style={{ paddingRight: '3rem' }}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-[34px] transition-opacity hover:opacity-80"
                            style={{ color: 'var(--fc-text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="fc-btn-brass w-full py-3 rounded-xl disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{ fontSize: '0.875rem', fontWeight: 600 }}
                    >
                        {isLoading ? 'Resetting...' : 'Set New Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
