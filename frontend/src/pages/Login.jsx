import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowUpRight, Eye, EyeOff, Scale, Shield, Zap } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [debugOtp, setDebugOtp] = useState(null);
    const [showOtp, setShowOtp] = useState(false);
    const [tempUserId, setTempUserId] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, verifyOtp, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            if (showOtp) {
                await verifyOtp(tempUserId, otp, 'login');
                navigate('/dashboard');
            } else {
                const res = await login(email, password);
                if (res.requireOtp) {
                    setShowOtp(true);
                    setTempUserId(res.tempId);
                    if (res.debugOtp) {
                        setDebugOtp(res.debugOtp);
                    }
                    setIsLoading(false);
                } else {
                    navigate('/dashboard', { replace: true });
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--fc-bg-deep)', fontFamily: 'var(--fc-font-sans)' }}>
            {/* Left Side — Atmospheric Hero */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: 'var(--fc-bg-deep)' }}>
                {/* Layered background */}
                <div className="absolute inset-0" style={{
                    background: 'radial-gradient(ellipse at 30% 20%, rgba(140,114,219,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(114,162,218,0.06) 0%, transparent 50%)'
                }} />
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30 Z' fill='none' stroke='rgba(140,114,219,0.04)' stroke-width='1'/%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }} />
                {/* Subtle vertical line */}
                <div className="absolute right-0 top-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom, transparent, var(--fc-border-warm), transparent)' }} />

                <div className="relative z-10 flex flex-col justify-center px-16 h-full">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8" style={{ background: 'var(--fc-green-dim)', border: '1px solid rgba(135,192,115,0.25)' }}>
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--fc-green)' }} />
                            <span style={{ color: 'var(--fc-green)', fontSize: '0.75rem', fontWeight: 500 }}>System Operational</span>
                        </div>

                        <h1 className="fc-heading" style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '1.5rem', color: 'var(--fc-text-primary)' }}>
                            Command Your<br />
                            <span style={{ color: 'var(--fc-purple)' }}>Legal Practice</span>
                        </h1>

                        <p style={{ fontSize: '1.125rem', color: 'var(--fc-text-secondary)', maxWidth: '28rem', lineHeight: 1.7, marginBottom: '3rem' }}>
                            A precision-engineered platform for modern law firms. Delegate tasks, track progress, and maintain impeccable oversight.
                        </p>

                        <div className="flex gap-10">
                            {[
                                { icon: Scale, label: 'Case Tracking', desc: 'Organized' },
                                { icon: Shield, label: 'Secure', desc: 'Encrypted' },
                                { icon: Zap, label: 'Real-time', desc: 'Updates' },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + i * 0.15, duration: 0.6 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="p-2 rounded-lg" style={{ background: 'var(--fc-bg-surface)', border: '1px solid var(--fc-border)' }}>
                                        <item.icon size={18} style={{ color: 'var(--fc-blue)' }} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--fc-text-primary)' }}>{item.label}</p>
                                        <p style={{ fontSize: '0.6875rem', color: 'var(--fc-text-muted)' }}>{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side — Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 relative" style={{ background: 'var(--fc-bg-raised)' }}>
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-[400px]"
                >
                    <div className="mb-10">
                        <h2 className="fc-heading font-bold" style={{ fontSize: '2rem', color: 'var(--fc-text-primary)', marginBottom: '0.5rem' }}>
                            Sign In
                        </h2>
                        <p style={{ color: 'var(--fc-text-muted)', fontSize: '0.9rem' }}>Enter your credentials to access the dashboard.</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
                            style={{
                                background: error.includes('DEV OTP') ? 'var(--fc-info-dim)' : 'var(--fc-danger-dim)',
                                border: `1px solid ${error.includes('DEV OTP') ? 'rgba(96,165,250,0.2)' : 'rgba(229,91,91,0.2)'}`,
                                color: error.includes('DEV OTP') ? 'var(--fc-info)' : 'var(--fc-danger)',
                            }}
                        >
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: error.includes('DEV OTP') ? 'var(--fc-info)' : 'var(--fc-danger)' }} />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!showOtp ? (
                            <>
                                <div>
                                    <label className="fc-label">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors w-5 h-5" style={{ color: 'var(--fc-text-dim)' }} />
                                        <input
                                            type="email"
                                            required
                                            className="fc-input fc-input-icon"
                                            placeholder="name@firm.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="fc-label" style={{ marginBottom: 0 }}>Password</label>
                                        <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--fc-purple)', fontWeight: 600 }} className="hover:opacity-80 transition-opacity">Forgot password?</Link>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors w-5 h-5" style={{ color: 'var(--fc-text-dim)' }} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            className="fc-input fc-input-icon"
                                            style={{ paddingRight: '3rem' }}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:opacity-80"
                                            style={{ color: 'var(--fc-text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'var(--fc-info-dim)', border: '1px solid rgba(96,165,250,0.2)', color: 'var(--fc-info)' }}>
                                    {debugOtp ? (
                                        <span style={{ fontWeight: 600 }}>DEV OTP Code: {debugOtp}</span>
                                    ) : (
                                        "OTP sent to your email. Please check."
                                    )}
                                </div>

                                <p style={{ color: 'var(--fc-text-secondary)', fontSize: '0.875rem' }}>
                                    For your security, please verify your identity by entering the code sent to your email.
                                </p>

                                <div>
                                    <label className="fc-label">Enter OTP</label>
                                    <input
                                        type="text"
                                        required
                                        className="fc-input text-center tracking-widest text-lg"
                                        style={{ fontFamily: 'var(--fc-font-mono)' }}
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength={6}
                                    />
                                    <p className="text-center mt-2" style={{ fontSize: '0.6875rem', color: 'var(--fc-text-dim)' }}>
                                        <strong>Demo Note:</strong> OTP is displayed above because email delivery is restricted on free hosting.
                                    </p>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="fc-btn-primary w-full py-3 rounded-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(11,17,32,0.3)', borderTopColor: 'var(--fc-bg-deep)' }} />
                            ) : (
                                <>
                                    {showOtp ? 'Verify & Login' : 'Sign In'} <ArrowUpRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6" style={{ borderTop: '1px solid var(--fc-border)' }}>
                        <p style={{ color: 'var(--fc-text-muted)', fontSize: '0.875rem' }}>
                            {showOtp ? (
                                <button type="button" onClick={() => setShowOtp(false)} style={{ color: 'var(--fc-purple)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }} className="hover:opacity-80 transition-opacity">Back to Login</button>
                            ) : (
                                <>Don't have an account? <a href="/signup" style={{ color: 'var(--fc-blue)', fontWeight: 600 }} className="hover:opacity-80 transition-opacity">Create Account</a></>
                            )}
                        </p>
                    </div>
                </motion.div>

                <div className="absolute bottom-6" style={{ color: 'var(--fc-text-dim)', fontSize: '0.75rem' }}>
                    &copy; 2026 FirmCommand Inc.
                </div>
            </div>
        </div>
    );
};

export default Login;
