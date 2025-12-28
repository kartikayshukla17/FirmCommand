import { useState } from 'react';
import axios from 'axios';
import { X, Mail, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ExitOrgModal = ({ isOpen, onClose, user, onExitSuccess, isLastBoss }) => {
    const { showToast } = useToast();
    const [step, setStep] = useState(1); // 1: Confirm, 2: OTP
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md p-6 relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-white"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <LogOutIcon className="text-red-500" /> Exit Organization
                </h2>

                <p className="text-zinc-400 text-sm mb-6">
                    {step === 1
                        ? (user?.role === 'Boss'
                            ? (isLastBoss
                                ? "CRITICAL WARNING: You are the LAST Boss. Exiting will PERMANENTLY DISSOLVE the organization, delete all tasks, and release all workers."
                                : "You are about to exit the organization. Ownership will be transferred to another Boss. The organization will NOT be dissolved.")
                            : "Are you sure you want to leave? If you have active tasks, your Boss must approve the request.")
                        : `Enter the OTP sent to ${user?.email} to confirm.`
                    }
                </p>

                {step === 1 && (
                    <div className="space-y-4">
                        <div className={`p-4 rounded-lg flex gap-3 text-sm border ${user?.role === 'Boss' && isLastBoss
                            ? 'bg-red-500/10 border-red-500/20 text-red-200'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                            }`}>
                            <AlertTriangle className="shrink-0" size={20} />
                            <p>{user?.role === 'Boss'
                                ? (isLastBoss
                                    ? "This action is IRREVERSIBLE. All organization data will be wiped."
                                    : "Ownership will be automatically transferred to the oldest remaining Boss.")
                                : "This action cannot be undone. You will lose access to all organization data immediately upon exit or approval."}
                            </p>
                        </div>

                        <button
                            onClick={handleSendOtp}
                            disabled={loading}
                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? 'Sending...' : 'Send OTP to Confirm'}
                            <Mail size={18} />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-zinc-400 text-sm mb-2">One-Time Password</label>
                            <input
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full bg-zinc-800 border-zinc-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-red-500 outline-none text-center tracking-widest text-xl"
                                maxLength={6}
                            />
                        </div>

                        <button
                            onClick={handleVerifyOtp}
                            disabled={loading}
                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? 'Verifying...' : 'Verify & Exit'}
                            <ShieldCheck size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const LogOutIcon = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        {...props}
    >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);

export default ExitOrgModal;
