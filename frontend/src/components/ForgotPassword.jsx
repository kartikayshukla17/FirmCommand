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
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-8">
                <Link to="/login" className="flex items-center text-zinc-400 hover:text-white mb-6 text-sm transition-colors">
                    <ArrowLeft size={16} className="mr-1" /> Back to Login
                </Link>

                <h2 className="text-3xl font-bold text-white mb-2">Forgot Password</h2>
                <p className="text-zinc-400 mb-6 text-sm">Enter your email address to receive a password reset link.</p>

                {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}
                {message && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm">{message}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-zinc-300">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white outline-none transition-all placeholder:text-zinc-600"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 ${isLoading ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
