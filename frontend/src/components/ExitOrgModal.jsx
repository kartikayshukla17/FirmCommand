import { useState } from 'react';
import axios from 'axios';
import { X, Mail, ShieldCheck, AlertTriangle, LogOut } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ExitOrgModal = ({ isOpen, onClose, user, onExitSuccess, isLastBoss }) => {
    const { showToast } = useToast();
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    if (!isOpen) return null;

    const handleSendOtp = async () => {
        setLoading(true);
        try {
            await axios.post('/api/auth/exit-otp');
            showToast('OTP sent to your email', 'success');
            setEmailSent(true);
            setStep(2);
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to send OTP', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length < 6) {
            showToast('Please enter a valid 6-digit OTP', 'error');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('/api/auth/exit-verify', { otp });
            if (res.data.status === 'Exited') {
                showToast('You have successfully left the organization', 'success');
                onExitSuccess({ exited: true });
            } else if (res.data.status === 'Pending') {
                showToast(res.data.message || 'Exit request sent to Boss', 'info');
                onExitSuccess({ exited: false, pending: true });
            }
            onClose();
        } catch (error) {
            showToast(error.response?.data?.message || 'Verification failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50"
            style={{ background: 'rgba(5, 9, 18, 0.85)', backdropFilter: 'blur(8px)' }}>
            <div className="w-full max-w-md p-6 relative rounded-xl"
                style={{
                    background: 'var(--fc-bg-raised)',
                    border: '1px solid var(--fc-border)',
                    boxShadow: 'var(--fc-shadow-lg)',
                }}>
                <button onClick={onClose} className="absolute top-4 right-4 transition-colors"
                    style={{ color: 'var(--fc-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={20} />
                </button>

                <h2 className="fc-heading flex items-center gap-2 mb-2" style={{ fontSize: '1.25rem', color: 'var(--fc-text-primary)' }}>
                    <LogOut style={{ color: 'var(--fc-danger)' }} size={20} /> Exit Organization
                </h2>

                <p style={{ color: 'var(--fc-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    {step === 1
                        ? (user?.role === 'Boss'
                            ? (isLastBoss
                                ? "CRITICAL WARNING: You are the LAST Boss. Exiting will PERMANENTLY DISSOLVE the organization."
                                : "Ownership will be transferred to another Boss. The organization will NOT be dissolved.")
                            : "Are you sure you want to leave? If you have active tasks, your Boss must approve the request.")
                        : `Enter the OTP sent to ${user?.email} to confirm.`
                    }
                </p>

                {step === 1 && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg flex gap-3 text-sm"
                            style={{
                                background: (user?.role === 'Boss' && isLastBoss) ? 'var(--fc-danger-dim)' : 'var(--fc-orange-dim)',
                                border: `1px solid ${(user?.role === 'Boss' && isLastBoss) ? 'rgba(229,91,91,0.2)' : 'rgba(219,134,72,0.2)'}`,
                                color: (user?.role === 'Boss' && isLastBoss) ? 'var(--fc-danger)' : 'var(--fc-orange)',
                            }}>
                            <AlertTriangle className="shrink-0" size={20} />
                            <p>{user?.role === 'Boss'
                                ? (isLastBoss
                                    ? "This action is IRREVERSIBLE. All organization data will be wiped."
                                    : "Ownership will be automatically transferred to the oldest remaining Boss.")
                                : "This action cannot be undone. You will lose access to all organization data."}</p>
                        </div>

                        <button onClick={handleSendOtp} disabled={loading}
                            className="w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                            style={{ background: 'var(--fc-danger)', color: '#fff', border: 'none' }}>
                            {loading ? 'Sending...' : 'Send OTP to Confirm'}
                            <Mail size={18} />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <div>
                            <label className="fc-label">One-Time Password</label>
                            <input
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="fc-input text-center tracking-widest text-xl"
                                style={{ fontFamily: 'var(--fc-font-mono)' }}
                                maxLength={6}
                            />
                        </div>

                        <button onClick={handleVerifyOtp} disabled={loading}
                            className="w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                            style={{ background: 'var(--fc-danger)', color: '#fff', border: 'none' }}>
                            {loading ? 'Verifying...' : 'Verify & Exit'}
                            <ShieldCheck size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExitOrgModal;
