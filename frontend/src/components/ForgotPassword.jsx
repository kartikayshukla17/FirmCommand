import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true);

        try {
            await axios.post('/api/auth/forgot-password', { email });
            setMessage('Email sent! Please check your inbox for the password reset link.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send email');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--fc-bg-deep)', fontFamily: 'var(--fc-font-sans)' }}>
            <div className="max-w-md w-full fc-glass p-8 rounded-2xl" style={{ boxShadow: 'var(--fc-shadow-lg)' }}>
                <Link to="/login" className="flex items-center mb-6 text-sm transition-opacity hover:opacity-80" style={{ color: 'var(--fc-text-secondary)', textDecoration: 'none' }}>
                    <ArrowLeft size={16} className="mr-1" /> Back to Login
                </Link>

                <h2 className="fc-serif" style={{ fontSize: '1.875rem', color: 'var(--fc-text-primary)', marginBottom: '0.5rem' }}>Forgot Password</h2>
                <p style={{ color: 'var(--fc-text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Enter your email address to receive a password reset link.</p>

                {error && (
                    <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'var(--fc-danger-dim)', border: '1px solid rgba(229,91,91,0.2)', color: 'var(--fc-danger)' }}>
                        {error}
                    </div>
                )}
                {message && (
                    <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'var(--fc-success-dim)', border: '1px solid rgba(52,211,153,0.2)', color: 'var(--fc-success)' }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="fc-label">Email Address</label>
                        <input
                            type="email"
                            required
                            className="fc-input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="fc-btn-brass w-full py-3 rounded-xl disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{ fontSize: '0.875rem', fontWeight: 600 }}
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
