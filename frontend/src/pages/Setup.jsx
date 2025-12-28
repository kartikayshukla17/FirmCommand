import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, ChevronRight, Check, Shield } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const Setup = () => {
    const [formData, setFormData] = useState({
        username: '', email: '', password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await axios.post('/api/auth/setup', formData);
            setIsSuccess(true);

            // Delay for success animation
            setTimeout(async () => {
                await login(formData.email, formData.password);
                navigate('/dashboard');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Setup failed');
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 font-sans selection:bg-indigo-500/30">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-900 to-zinc-950"></div>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 text-center p-12 bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-emerald-500/20 shadow-2xl ring-1 ring-emerald-500/10"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-emerald-500/50"
                    >
                        <Check className="w-10 h-10 text-emerald-500" strokeWidth={3} />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-white mb-2">Setup Complete</h2>
                    <p className="text-zinc-400">Initializing your workspace...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 font-sans selection:bg-indigo-500/30 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute inset-0 bg-radial-gradient(circle_at_center,transparent_0%,#09090b_100%)"></div>
            </div>

            <div className="absolute top-8 right-8 z-20">
                {/* ThemeToggle removed */}
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="relative z-10 w-full max-w-lg mx-4"
            >
                <div className="bg-zinc-900/80 backdrop-blur-xl p-8 md:p-10 rounded-2xl shadow-2xl border border-zinc-800/80 ring-1 ring-white/5">
                    <motion.div variants={itemVariants} className="text-center mb-8">
                        <div className="inline-flex p-3 rounded-xl bg-indigo-500/10 mb-4 ring-1 ring-indigo-500/30">
                            <Shield className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Initialize System</h2>
                        <p className="text-zinc-500">Create your Master Admin account to begin</p>
                    </motion.div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <motion.div variants={itemVariants} className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-300">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
                                <input
                                    name="username"
                                    required
                                    className="w-full bg-zinc-800/50 border border-zinc-700 text-white px-10 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-zinc-600 sm:text-sm"
                                    placeholder="John Doe"
                                    onChange={handleChange}
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-300">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full bg-zinc-800/50 border border-zinc-700 text-white px-10 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-zinc-600 sm:text-sm"
                                    placeholder="admin@firm.com"
                                    onChange={handleChange}
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-300">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full bg-zinc-800/50 border border-zinc-700 text-white px-10 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-zinc-600 sm:text-sm"
                                    placeholder="••••••••"
                                    onChange={handleChange}
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="pt-2">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    'Initializing...'
                                ) : (
                                    <>
                                        Setup System <ChevronRight className="w-4 h-4" />
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Setup;
