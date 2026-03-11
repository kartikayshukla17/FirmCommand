import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Building, Hash, ChevronRight, Briefcase, Plus, Users, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [mode, setMode] = useState('create');
    const [formData, setFormData] = useState({
        username: '', email: '', password: '',
        orgName: '', orgCode: '', role: 'Associate'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [otp, setOtp] = useState('');
    const [debugOtp, setDebugOtp] = useState(null);
    const [showOtp, setShowOtp] = useState(false);
    const [tempUserId, setTempUserId] = useState(null);

    const navigate = useNavigate();
    const { login, verifyOtp } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            const payload = {
                mode,
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: mode === 'create' ? 'Lead' : formData.role,
                orgName: mode === 'create' ? formData.orgName : undefined,
                orgCode: mode === 'join' ? formData.orgCode : undefined
            };

            const res = await axios.post('/api/auth/register', payload);

            if (res.data.requireOtp) {
                setShowOtp(true);
                setTempUserId(res.data.tempId);
                setSuccessMsg(res.data.message);
                if (res.data.debugOtp) {
                    setDebugOtp(res.data.debugOtp);
                }
                setIsLoading(false);
                return;
            }

            if (mode === 'create') {
                await login(formData.email, formData.password);
                navigate('/dashboard');
            } else {
                setSuccessMsg('Request sent! Please ask your Organization Admin to approve your account.');
                setIsLoading(false);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await verifyOtp(tempUserId, otp, 'signup');
            navigate('/login', { state: { message: 'Verification successful! Please log in.' } });
        } catch (err) {
            setError(err.response?.data?.message || 'OTP verification failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4" style={{ background: 'var(--fc-bg-deep)', fontFamily: 'var(--fc-font-sans)' }}>
            {/* Background patterns */}
            <div className="absolute inset-0" style={{
                background: 'radial-gradient(ellipse at 50% 0%, rgba(140,114,219,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(114,162,218,0.04) 0%, transparent 50%)'
            }} />
            <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30 Z' fill='none' stroke='rgba(140,114,219,0.03)' stroke-width='1'/%3E%3C/svg%3E")`,
                backgroundSize: '60px 60px'
            }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-xl relative z-10"
            >
                <div className="fc-glass p-8 rounded-2xl" style={{ boxShadow: 'var(--fc-shadow-lg)' }}>
                    <div className="text-center mb-8">
                        <h2 className="fc-heading font-bold" style={{ fontSize: '1.75rem', color: 'var(--fc-text-primary)', marginBottom: '0.5rem' }}>
                            {mode === 'create' ? 'Create Organization' : 'Join Organization'}
                        </h2>
                        <p style={{ color: 'var(--fc-text-muted)', fontSize: '0.875rem' }}>
                            {mode === 'create' ? 'Start a new team and manage tasks' : 'Enter your organization code to join'}
                        </p>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex p-1 rounded-lg mb-8 relative" style={{ background: 'var(--fc-bg-deep)', border: '1px solid var(--fc-border)' }}>
                        <motion.div
                            className="absolute top-1 bottom-1 rounded-md"
                            style={{ background: 'var(--fc-bg-hover)', width: 'calc(50% - 4px)', boxShadow: 'var(--fc-shadow-sm)' }}
                            animate={{ x: mode === 'create' ? '0%' : '100%' }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                        <button
                            onClick={() => setMode('create')}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium relative z-10 transition-colors"
                            style={{ color: mode === 'create' ? 'var(--fc-purple)' : 'var(--fc-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <Plus size={16} /> Create New
                        </button>
                        <button
                            onClick={() => setMode('join')}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium relative z-10 transition-colors"
                            style={{ color: mode === 'join' ? 'var(--fc-purple)' : 'var(--fc-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <Users size={16} /> Join Existing
                        </button>
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
                            style={{ background: 'var(--fc-danger-dim)', border: '1px solid rgba(229,91,91,0.2)', color: 'var(--fc-danger)' }}>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--fc-danger)' }} />{error}
                        </motion.div>
                    )}

                    {successMsg && !showOtp && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
                            style={{ background: 'var(--fc-success-dim)', border: '1px solid rgba(52,211,153,0.2)', color: 'var(--fc-success)' }}>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--fc-success)' }} />
                            <div>
                                <p style={{ fontWeight: 600 }}>Success!</p>
                                <p>{successMsg}</p>
                                <Link to="/login" className="underline mt-1 block" style={{ color: 'var(--fc-green)' }}>Go to Login</Link>
                            </div>
                        </motion.div>
                    )}

                    {showOtp ? (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
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
                                <label className="fc-label">Enter Verification Code</label>
                                <input
                                    type="text"
                                    required
                                    className="fc-input text-center tracking-widest text-lg"
                                    style={{ fontFamily: 'var(--fc-font-mono)' }}
                                    placeholder="XXXXXX"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="fc-btn-primary w-full py-3 mt-2"
                            >
                                {isLoading ? 'Verifying...' : 'Verify & Continue'}
                            </button>
                            <p className="text-center mt-4 px-2" style={{ fontSize: '0.6875rem', color: 'var(--fc-text-dim)' }}>
                                <strong>Demo Note:</strong> OTP is displayed above because email delivery is restricted on free hosting.
                            </p>
                        </form>
                    ) : (
                        !successMsg && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <AnimatePresence mode="wait">
                                    {mode === 'create' ? (
                                        <motion.div
                                            key="create-field"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <label className="fc-label">Organization Name</label>
                                            <div className="relative group">
                                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--fc-text-dim)' }} />
                                                <input name="orgName" required={mode === 'create'} className="fc-input fc-input-icon" placeholder="Acme Legal" onChange={handleChange} />
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="join-field"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-4"
                                        >
                                            <div>
                                                <label className="fc-label">Organization Code</label>
                                                <div className="relative group">
                                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--fc-text-dim)' }} />
                                                    <input name="orgCode" required={mode === 'join'} className="fc-input fc-input-icon uppercase tracking-wider" style={{ fontFamily: 'var(--fc-font-mono)' }} placeholder="CORP123" onChange={handleChange} />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="fc-label">I am joining as a</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, role: 'Associate' })}
                                                        className="py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                                                        style={{
                                                            background: formData.role === 'Associate' ? 'var(--fc-blue-dim)' : 'var(--fc-bg-deep)',
                                                            border: `1px solid ${formData.role === 'Associate' ? 'var(--fc-blue)' : 'var(--fc-border)'}`,
                                                            color: formData.role === 'Associate' ? 'var(--fc-blue)' : 'var(--fc-text-muted)',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <Briefcase size={16} /> Associate
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, role: 'Lead' })}
                                                        className="py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                                                        style={{
                                                            background: formData.role === 'Lead' ? 'var(--fc-purple-dim)' : 'var(--fc-bg-deep)',
                                                            border: `1px solid ${formData.role === 'Lead' ? 'var(--fc-purple)' : 'var(--fc-border)'}`,
                                                            color: formData.role === 'Lead' ? 'var(--fc-purple)' : 'var(--fc-text-muted)',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <Building size={16} /> Lead
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div>
                                    <label className="fc-label">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--fc-text-dim)' }} />
                                        <input name="username" required className="fc-input fc-input-icon" placeholder="John Doe" onChange={handleChange} />
                                    </div>
                                </div>
                                <div>
                                    <label className="fc-label">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--fc-text-dim)' }} />
                                        <input name="email" type="email" required className="fc-input fc-input-icon" placeholder="name@company.com" onChange={handleChange} />
                                    </div>
                                </div>
                                <div>
                                    <label className="fc-label">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--fc-text-dim)' }} />
                                        <input name="password" type={showPassword ? 'text' : 'password'} required className="fc-input fc-input-icon" style={{ paddingRight: '3rem' }} placeholder="••••••••" onChange={handleChange} />
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

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="fc-btn-primary w-full py-3 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                                    style={{ fontSize: '0.95rem' }}
                                >
                                    {isLoading ? 'Processing...' : (
                                        <>
                                            {mode === 'create' ? 'Create Organization' : 'Send Join Request'} <ChevronRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )
                    )}

                    <div className="mt-8 text-center pt-6" style={{ borderTop: '1px solid var(--fc-border)' }}>
                        <p style={{ color: 'var(--fc-text-muted)', fontSize: '0.875rem' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: 'var(--fc-blue)', fontWeight: 600 }} className="hover:opacity-80 transition-opacity">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
