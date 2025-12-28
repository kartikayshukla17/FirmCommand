import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, ArrowUpRight, Eye, EyeOff } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [tempUserId, setTempUserId] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, verifyOtp, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            console.log('Login: User present, navigating to dashboard');
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            if (showOtp) {
                await verifyOtp(tempUserId, otp);
                navigate('/dashboard');
            } else {
                const res = await login(email, password);
                if (res.requireOtp) {
                    setShowOtp(true);
                    setTempUserId(res.tempId);
                    // For demo/dev purposes where email service is unreliable
                    if (res.debugOtp) {
                        setError(`DEV OTP Code: ${res.debugOtp}`);
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
        <div className="min-h-screen flex bg-zinc-900 text-zinc-100 font-sans selection:bg-indigo-500/30">
            {/* Left Side - Hero Section */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-zinc-900 border-r border-zinc-800">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-zinc-900 to-zinc-900 z-10"></div>

                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] z-0"></div>

                <div className="relative z-20 flex flex-col justify-center px-16 h-full">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700 text-xs font-medium text-emerald-400 mb-6 w-fit">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            System Operational
                        </div>
                        <h1 className="text-5xl font-bold mb-6 leading-tight tracking-tight text-white">
                            Master Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Legal Workflow</span>
                        </h1>
                        <p className="text-xl text-zinc-400 mb-10 max-w-md leading-relaxed">
                            A precision-engineered platform for modern law firms. Secure, fast, and relentlessly efficient.
                        </p>

                        <div className="flex gap-6">
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-white">2.5x</span>
                                <span className="text-sm text-zinc-500 uppercase tracking-wider font-medium mt-1">Efficiency Boost</span>
                            </div>
                            <div className="w-px h-12 bg-zinc-800"></div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-white">100%</span>
                                <span className="text-sm text-zinc-500 uppercase tracking-wider font-medium mt-1">Secure Cloud</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 relative">
                <div className="absolute top-8 right-8">
                    {/* ThemeToggle removed as we are enforcing dark theme */}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[400px]"
                >
                    <div className="mb-10">
                        <h2 className="text-2xl font-semibold text-white mb-2">Sign In</h2>
                        <p className="text-zinc-500">Enter your credentials to access the dashboard.</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className={`${error.includes('DEV OTP') ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} border px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2`}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${error.includes('DEV OTP') ? 'bg-indigo-500' : 'bg-red-500'}`}></div>
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!showOtp ? (
                            <>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-zinc-300">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
                                        <input
                                            type="email"
                                            required
                                            className="w-full bg-zinc-800/50 border border-zinc-700 text-white px-10 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-zinc-600"
                                            placeholder="name@firm.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-zinc-300">Password</label>
                                        <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</Link>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            className="w-full bg-zinc-800/50 border border-zinc-700 text-white px-10 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-zinc-600 pr-12"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
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
                            </>
                        ) : (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-300">Enter OTP</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-zinc-800/50 border border-zinc-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-zinc-600 font-mono text-center tracking-widest text-lg"
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength={6}
                                    />
                                </div>
                                <p className="text-xs text-zinc-500 text-center mt-2">Check your email for the verification code.</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {showOtp ? 'Verify & Login' : 'Sign In'} <ArrowUpRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-zinc-800/50 pt-6">
                        <p className="text-zinc-500 text-sm">
                            {showOtp ? (
                                <button type="button" onClick={() => setShowOtp(false)} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Back to Login</button>
                            ) : (
                                <>Don't have an account? <a href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Create Account</a></>
                            )}
                        </p>
                    </div>
                </motion.div>

                <div className="absolute bottom-6 text-zinc-600 text-xs">
                    &copy; 2024 LegalFlow Inc.
                </div>
            </div>
        </div>
    );
};

export default Login;
