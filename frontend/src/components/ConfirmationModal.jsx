import { motion } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger', confirmText = 'Confirm', cancelText = 'Cancel' }) => {
    if (!isOpen) return null;

    const icons = {
        danger: <AlertTriangle style={{ color: 'var(--fc-danger)' }} size={32} />,
        info: <Info style={{ color: 'var(--fc-info)' }} size={32} />,
        success: <CheckCircle style={{ color: 'var(--fc-teal-light)' }} size={32} />
    };

    const confirmStyles = {
        danger: { background: 'var(--fc-danger)', color: '#fff', border: '1px solid var(--fc-danger)' },
        info: { background: 'linear-gradient(135deg, var(--fc-brass) 0%, var(--fc-brass-dim) 100%)', color: 'var(--fc-bg-deep)', border: '1px solid var(--fc-brass)' },
        success: { background: 'linear-gradient(135deg, var(--fc-teal) 0%, var(--fc-teal-dim) 100%)', color: '#fff', border: '1px solid var(--fc-teal)' }
    };

    const iconBgStyles = {
        danger: { background: 'var(--fc-danger-dim)', border: '1px solid rgba(229,91,91,0.2)' },
        info: { background: 'var(--fc-brass-glow)', border: '1px solid var(--fc-border-warm)' },
        success: { background: 'var(--fc-teal-glow)', border: '1px solid rgba(42,124,111,0.2)' }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
                style={{ background: 'rgba(5, 9, 18, 0.85)', backdropFilter: 'blur(8px)' }}
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md p-6 rounded-xl overflow-hidden"
                style={{
                    background: 'var(--fc-bg-raised)',
                    border: '1px solid var(--fc-border)',
                    boxShadow: 'var(--fc-shadow-lg)',
                }}
            >
                <div className="flex flex-col items-center text-center">
                    <div className="p-4 rounded-full mb-4" style={iconBgStyles[type]}>
                        {icons[type]}
                    </div>

                    <h3 className="fc-serif" style={{ fontSize: '1.25rem', color: 'var(--fc-text-primary)', marginBottom: '0.5rem' }}>{title}</h3>
                    <p style={{ color: 'var(--fc-text-secondary)', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                        {message}
                    </p>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="fc-btn-ghost flex-1 py-2.5 rounded-lg font-medium"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-2.5 rounded-lg font-medium transition-all cursor-pointer"
                            style={{ ...confirmStyles[type], boxShadow: type === 'danger' ? '0 4px 12px rgba(229,91,91,0.2)' : 'var(--fc-shadow-brass)' }}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ConfirmationModal;
