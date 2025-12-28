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
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-8">
                <Link to="/login" className="flex items-center text-zinc-400 hover:text-white mb-6 text-sm transition-colors">
                    <ArrowLeft size={16} className="mr-1" /> Back to Login
                </Link>

                <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
                <p className="text-zinc-400 mb-6 text-sm">Enter your new password below.</p>

                {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}
                {message && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm">{message}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <label className="block text-sm font-medium mb-1.5 text-zinc-300">New Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white outline-none transition-all placeholder:text-zinc-600 pr-12"
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-[34px] text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-medium mb-1.5 text-zinc-300">Confirm Password</label>
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white outline-none transition-all placeholder:text-zinc-600 pr-12"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-[34px] text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 ${isLoading ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                    >
                        {isLoading ? 'Resetting...' : 'Set New Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
