import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Building, Key, ChevronRight, Briefcase, Plus, Users, Hash, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [mode, setMode] = useState('create'); // 'create' or 'join'
    const [formData, setFormData] = useState({
        username: '', email: '', password: '',
        orgName: '', orgCode: '', role: 'Associate' // Default role for joiners
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // OTP States
    const [otp, setOtp] = useState('');
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
                setIsLoading(false);
                return;
            }

            if (mode === 'create') {
                // Should not happen for Boss since OTP is required, but fallback
                await login(formData.email, formData.password);
                navigate('/dashboard');
            } else {
                // Joiners wait for approval
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
            await verifyOtp(tempUserId, otp);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'OTP verification failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-zinc-100 font-sans selection:bg-indigo-500/30 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute inset-0 bg-radial-gradient(circle_at_center,transparent_0%,#18181b_100%)"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-xl mx-4 relative z-10"
            >
                <div className="bg-zinc-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-zinc-700/50 ring-1 ring-white/5">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {mode === 'create' ? 'Create Organization' : 'Join Organization'}
                        </h2>
                        <p className="text-zinc-500 text-sm">
                            {mode === 'create' ? 'Start a new team and manage tasks' : 'Enter your organization code to join'}
                        </p>
                    </div>

                    {/* Mode Toggles */}
                    <div className="flex bg-zinc-900/50 p-1 rounded-lg mb-8 relative border border-zinc-800">
                        <motion.div
                            className="absolute top-1 bottom-1 bg-zinc-700 rounded-md shadow-sm w-[calc(50%-4px)]"
                            animate={{ x: mode === 'create' ? '0%' : '100%' }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                        <button
                            onClick={() => setMode('create')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium relative z-10 transition-colors ${mode === 'create' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Plus size={16} /> Create New
                        </button>
                        <button
                            onClick={() => setMode('join')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium relative z-10 transition-colors ${mode === 'join' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Users size={16} /> Join Existing
                        </button>
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>{error}
                        </motion.div>
                    )}

                    {successMsg && !showOtp && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <div>
                                <p className="font-semibold">Success!</p>
                                <p>{successMsg}</p>
                                <Link to="/login" className="underline mt-1 block">Go to Login</Link>
                            </div>
                        </motion.div>
                    )}

                    {showOtp ? (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-3 rounded-lg mb-6 text-sm">
                                OTP sent to your email. Please check.
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-300">Enter Verification Code</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-zinc-900/50 border border-zinc-700 text-white px-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-center tracking-widest text-lg"
                                    placeholder="XXXXXX"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:opacity-70"
                            >
                                {isLoading ? 'Verifying...' : 'Verify & Continue'}
                            </button>
                        </form>
                    ) : (
                        !successMsg && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Org Fields */}
                                <AnimatePresence mode="wait">
                                    {mode === 'create' ? (
                                        <motion.div
                                            key="create-field"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-1.5"
                                        >
                                            <label className="text-sm font-medium text-zinc-300">Organization Name</label>
                                            <div className="relative group">
                                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
                                                <input
                                                    name="orgName"
                                                    required={mode === 'create'}
                                                    className="w-full bg-zinc-900/50 border border-zinc-700 text-white px-10 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-zinc-600 sm:text-sm"
                                                    placeholder="Acme Corp"
                                                    onChange={handleChange}
                                                />
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
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-zinc-300">Organization Code</label>
                                                <div className="relative group">
                                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
                                                    <input
                                                        name="orgCode"
                                                        required={mode === 'join'}
                                                        className="w-full bg-zinc-900/50 border border-zinc-700 text-white px-10 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-zinc-600 sm:text-sm uppercase font-mono tracking-wider"
                                                        placeholder="LAW123"
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-zinc-300">I am joining as a</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, role: 'Associate' })}
                                                        className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${formData.role === 'Associate' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-zinc-900/50 border-zinc-700 text-zinc-400 hover:bg-zinc-800'}`}
                                                    >
                                                        <Briefcase size={16} /> Associate
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, role: 'Lead' })}
                                                        className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${formData.role === 'Lead' ? 'bg-amber-600/20 border-amber-500 text-amber-400' : 'bg-zinc-900/50 border-zinc-700 text-zinc-400 hover:bg-zinc-800'}`}
                                                    >
                                                        <Building size={16} /> Lead
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Standard Fields */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-zinc-300">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
                                        <input
                                            name="username"
                                            required
                                            className="w-full bg-zinc-900/50 border border-zinc-700 text-white px-10 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-zinc-600 sm:text-sm"
                                            placeholder="John Doe"
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-zinc-300">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            className="w-full bg-zinc-900/50 border border-zinc-700 text-white px-10 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-zinc-600 sm:text-sm"
                                            placeholder="name@company.com"
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-zinc-300">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
                                        <input
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            className="w-full bg-zinc-900/50 border border-zinc-700 text-white px-10 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-zinc-600 sm:text-sm pr-12"
                                            placeholder="••••••••"
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
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

                    <div className="mt-8 text-center border-t border-zinc-700/50 pt-6">
                        <p className="text-zinc-500 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
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
