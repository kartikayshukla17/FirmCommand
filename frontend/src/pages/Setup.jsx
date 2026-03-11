import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ChevronRight, Check, Shield } from 'lucide-react';

const Setup = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
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
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--fc-bg-deep)', fontFamily: 'var(--fc-font-sans)' }}>
                <div className="absolute inset-0" style={{
                    background: 'radial-gradient(ellipse at top, rgba(42,124,111,0.1), transparent 60%)'
                }} />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 text-center p-12 fc-glass rounded-2xl"
                    style={{ borderColor: 'rgba(42,124,111,0.3)' }}
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                        style={{ background: 'var(--fc-teal-glow)', border: '1px solid rgba(42,124,111,0.4)' }}
                    >
                        <Check className="w-10 h-10" style={{ color: 'var(--fc-teal-light)' }} strokeWidth={3} />
                    </motion.div>
                    <h2 className="fc-serif" style={{ fontSize: '1.875rem', color: 'var(--fc-text-primary)', marginBottom: '0.5rem' }}>Setup Complete</h2>
                    <p style={{ color: 'var(--fc-text-secondary)' }}>Initializing your workspace...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4" style={{ background: 'var(--fc-bg-deep)', fontFamily: 'var(--fc-font-sans)' }}>
            {/* Background */}
            <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30 Z' fill='none' stroke='rgba(200,169,110,0.03)' stroke-width='1'/%3E%3C/svg%3E")`,
                backgroundSize: '60px 60px'
            }} />
            <div className="absolute inset-0" style={{
                background: 'radial-gradient(ellipse at center, transparent 0%, var(--fc-bg-deep) 70%)'
            }} />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="relative z-10 w-full max-w-lg"
            >
                <div className="fc-glass p-8 md:p-10 rounded-2xl" style={{ boxShadow: 'var(--fc-shadow-lg)' }}>
                    <motion.div variants={itemVariants} className="text-center mb-8">
                        <div className="inline-flex p-3 rounded-xl mb-4" style={{ background: 'var(--fc-brass-glow)', border: '1px solid var(--fc-border-warm)' }}>
                            <Shield className="w-8 h-8" style={{ color: 'var(--fc-brass)' }} />
                        </div>
                        <h2 className="fc-serif" style={{ fontSize: '1.5rem', color: 'var(--fc-text-primary)', marginBottom: '0.5rem' }}>Initialize System</h2>
                        <p style={{ color: 'var(--fc-text-muted)', fontSize: '0.875rem' }}>Create your Master Admin account to begin</p>
                    </motion.div>

                    {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
                            style={{ background: 'var(--fc-danger-dim)', border: '1px solid rgba(229,91,91,0.2)', color: 'var(--fc-danger)' }}>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--fc-danger)' }} />{error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <motion.div variants={itemVariants}>
                            <label className="fc-label">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--fc-text-dim)' }} />
                                <input name="username" required className="fc-input fc-input-icon" placeholder="John Doe" onChange={handleChange} />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="fc-label">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--fc-text-dim)' }} />
                                <input name="email" type="email" required className="fc-input fc-input-icon" placeholder="admin@firm.com" onChange={handleChange} />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="fc-label">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--fc-text-dim)' }} />
                                <input name="password" type="password" required className="fc-input fc-input-icon" placeholder="••••••••" onChange={handleChange} />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="fc-btn-brass w-full py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                style={{ fontSize: '0.875rem' }}
                            >
                                {isLoading ? 'Initializing...' : (<>Setup System <ChevronRight className="w-4 h-4" /></>)}
                            </button>
                        </motion.div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Setup;
