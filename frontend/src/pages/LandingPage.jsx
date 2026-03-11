import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Scale, Shield, Zap, Users, ClipboardList, ArrowUpRight,
    CheckCircle, BarChart3, Bell, Lock
} from 'lucide-react';

const LandingPage = () => {

    const features = [
        { icon: <ClipboardList size={24} />, title: 'Task Delegation', desc: 'Create, assign, and track tasks across your legal team with a visual Kanban board.', accent: 'var(--fc-brass)' },
        { icon: <Users size={24} />, title: 'Team Management', desc: 'Manage associates and leads, approve join requests, and oversee your entire firm.', accent: 'var(--fc-teal-light)' },
        { icon: <Shield size={24} />, title: 'Secure Access', desc: 'OTP-verified authentication, role-based permissions, and encrypted communications.', accent: 'var(--fc-info)' },
        { icon: <Bell size={24} />, title: 'Real-time Alerts', desc: 'Instant notifications via WebSockets keep your team synchronized on every update.', accent: 'var(--fc-brass-light)' },
        { icon: <BarChart3 size={24} />, title: 'Progress Tracking', desc: 'Monitor task progress, proof of work submissions, and team performance at a glance.', accent: 'var(--fc-teal)' },
        { icon: <Lock size={24} />, title: 'Organization Control', desc: 'Full organizational lifecycle — from creation to dissolution — with OTP safeguards.', accent: 'var(--fc-danger)' },
    ];

    const steps = [
        { num: '01', title: 'Create Firm', desc: 'Sign up and create your organization in seconds.' },
        { num: '02', title: 'Build Team', desc: 'Invite associates with a unique organization code.' },
        { num: '03', title: 'Assign Tasks', desc: 'Delegate work and track progress on the Kanban board.' },
        { num: '04', title: 'Review & Ship', desc: 'Approve work, provide feedback, and close tasks.' },
    ];

    return (
        <div className="min-h-screen" style={{ background: 'var(--fc-bg-deep)', fontFamily: 'var(--fc-font-sans)', overflow: 'hidden' }}>
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse at 20% 0%, rgba(200,169,110,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(42,124,111,0.04) 0%, transparent 50%)'
            }} />
            <div className="fixed inset-0 pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30 Z' fill='none' stroke='rgba(200,169,110,0.025)' stroke-width='1'/%3E%3C/svg%3E")`,
                backgroundSize: '60px 60px'
            }} />

            {/* ═══ Nav ═══ */}
            <nav className="relative z-20 px-6 md:px-12 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--fc-border-subtle)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--fc-brass-glow)', border: '1px solid var(--fc-border-warm)' }}>
                        <Scale size={16} style={{ color: 'var(--fc-brass)' }} />
                    </div>
                    <span className="fc-serif" style={{ fontSize: '1.25rem', color: 'var(--fc-text-primary)', letterSpacing: '-0.01em' }}>FirmCommand</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                        style={{ color: 'var(--fc-text-secondary)', background: 'none', textDecoration: 'none' }}>
                        Sign In
                    </Link>
                    <Link to="/signup" className="fc-btn-brass px-5 py-2 rounded-lg text-sm flex items-center gap-1.5" style={{ textDecoration: 'none' }}>
                        Get Started <ArrowUpRight size={14} />
                    </Link>
                </div>
            </nav>

            {/* ═══ Hero ═══ */}
            <section className="relative z-10 px-6 md:px-12 pt-24 pb-20 max-w-5xl mx-auto text-center">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8" style={{ background: 'var(--fc-teal-glow)', border: '1px solid rgba(42,124,111,0.25)' }}>
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--fc-teal-light)' }} />
                        <span style={{ color: 'var(--fc-teal-light)', fontSize: '0.75rem', fontWeight: 500 }}>Built for Legal Professionals</span>
                    </div>

                    <h1 className="fc-serif" style={{
                        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                        lineHeight: 1.08,
                        color: 'var(--fc-text-primary)',
                        letterSpacing: '-0.03em',
                        marginBottom: '1.5rem',
                    }}>
                        Precision Task<br />Management for<br />
                        <span style={{ color: 'var(--fc-brass)', fontStyle: 'italic' }}>Modern Law Firms</span>
                    </h1>

                    <p style={{ fontSize: '1.125rem', color: 'var(--fc-text-secondary)', maxWidth: '36rem', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
                        Organize, delegate, and track work across your legal team.
                        From case management to corporate compliance — command your firm with confidence.
                    </p>

                    <div className="flex items-center justify-center gap-4">
                        <Link to="/signup" className="fc-btn-brass px-8 py-3 rounded-xl text-base flex items-center gap-2" style={{ textDecoration: 'none' }}>
                            Start Free <ArrowUpRight size={18} />
                        </Link>
                        <Link to="/login" className="fc-btn-ghost px-8 py-3 rounded-xl text-base" style={{ textDecoration: 'none' }}>
                            Sign In
                        </Link>
                    </div>
                </motion.div>

                {/* Decorative line */}
                <div className="mt-20 mx-auto" style={{ width: '1px', height: '80px', background: 'linear-gradient(to bottom, var(--fc-border-warm), transparent)' }} />
            </section>

            {/* ═══ Features Grid ═══ */}
            <section className="relative z-10 px-6 md:px-12 pb-24 max-w-6xl mx-auto">
                <div className="text-center mb-14">
                    <h2 className="fc-serif" style={{ fontSize: '2rem', color: 'var(--fc-text-primary)', marginBottom: '0.75rem' }}>Everything Your Firm Needs</h2>
                    <p style={{ color: 'var(--fc-text-muted)', fontSize: '1rem', maxWidth: '32rem', margin: '0 auto' }}>Purpose-built tools for law firm operations, from task tracking to team coordination.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08 }}
                            className="fc-card p-6 group"
                        >
                            <div className="p-3 rounded-xl mb-4 w-fit transition-all" style={{
                                background: `${f.accent}12`,
                                border: `1px solid ${f.accent}20`,
                            }}>
                                <div style={{ color: f.accent }}>{f.icon}</div>
                            </div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--fc-text-primary)', marginBottom: '0.5rem' }}>{f.title}</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--fc-text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══ How It Works ═══ */}
            <section className="relative z-10 px-6 md:px-12 pb-24 max-w-5xl mx-auto">
                <div className="text-center mb-14">
                    <h2 className="fc-serif" style={{ fontSize: '2rem', color: 'var(--fc-text-primary)', marginBottom: '0.75rem' }}>How It Works</h2>
                    <p style={{ color: 'var(--fc-text-muted)', fontSize: '1rem' }}>Go from setup to shipment in four steps.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.12 }}
                            className="text-center relative"
                        >
                            <div className="fc-serif mb-3" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--fc-brass)', opacity: 0.25 }}>{step.num}</div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--fc-text-primary)', marginBottom: '0.5rem' }}>{step.title}</h3>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--fc-text-muted)', lineHeight: 1.6 }}>{step.desc}</p>
                            {i < steps.length - 1 && (
                                <div className="hidden md:block absolute top-8 -right-3 w-6" style={{ borderTop: '1px dashed var(--fc-border-warm)' }} />
                            )}
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section className="relative z-10 px-6 md:px-12 pb-24 max-w-4xl mx-auto">
                <div className="text-center p-12 rounded-2xl fc-glass" style={{ boxShadow: 'var(--fc-shadow-glow)' }}>
                    <h2 className="fc-serif" style={{ fontSize: '1.75rem', color: 'var(--fc-text-primary)', marginBottom: '0.75rem' }}>Ready to Command Your Firm?</h2>
                    <p style={{ color: 'var(--fc-text-muted)', fontSize: '1rem', marginBottom: '2rem' }}>Join firms already managing tasks with precision.</p>
                    <Link to="/signup" className="fc-btn-brass inline-flex items-center gap-2 px-8 py-3 rounded-xl text-base" style={{ textDecoration: 'none' }}>
                        Create Your Organization <ArrowUpRight size={18} />
                    </Link>
                </div>
            </section>

            {/* ═══ Footer ═══ */}
            <footer className="relative z-10 px-6 md:px-12 py-8" style={{ borderTop: '1px solid var(--fc-border-subtle)' }}>
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Scale size={14} style={{ color: 'var(--fc-brass)' }} />
                        <span className="fc-serif" style={{ fontSize: '0.875rem', color: 'var(--fc-text-secondary)' }}>FirmCommand</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--fc-text-dim)' }}>&copy; 2026 FirmCommand Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
