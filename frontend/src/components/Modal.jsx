import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
                style={{ background: 'rgba(5, 9, 18, 0.85)', backdropFilter: 'blur(8px)' }}
                onClick={onClose}
            />

            {/* Modal Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl"
                style={{
                    background: 'var(--fc-bg-raised)',
                    border: '1px solid var(--fc-border)',
                    boxShadow: '0 0 0 1px rgba(140,114,219,0.1), var(--fc-shadow-lg), var(--fc-shadow-glow)',
                }}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 sticky top-0 z-10"
                    style={{
                        borderBottom: '1px solid var(--fc-border)',
                        background: 'rgba(17, 24, 39, 0.95)',
                        backdropFilter: 'blur(12px)',
                    }}
                >
                    <h2 className="fc-heading" style={{ fontSize: '1.25rem', color: 'var(--fc-text-primary)' }}>
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg transition-all duration-200"
                        style={{ color: 'var(--fc-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={(e) => { e.target.style.background = 'var(--fc-bg-hover)'; e.target.style.color = 'var(--fc-text-primary)'; }}
                        onMouseLeave={(e) => { e.target.style.background = 'none'; e.target.style.color = 'var(--fc-text-muted)'; }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {children}
                </div>
            </motion.div>
        </div>
    );
};

export default Modal;
