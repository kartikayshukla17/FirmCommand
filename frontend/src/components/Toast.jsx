import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: <CheckCircle className="w-5 h-5" style={{ color: 'var(--fc-teal-light)' }} />,
        error: <XCircle className="w-5 h-5" style={{ color: 'var(--fc-danger)' }} />,
        info: <Info className="w-5 h-5" style={{ color: 'var(--fc-brass)' }} />
    };

    const borderColors = {
        success: 'rgba(42, 124, 111, 0.3)',
        error: 'rgba(229, 91, 91, 0.3)',
        info: 'var(--fc-border-warm)'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            layout
            className="flex items-center gap-3 px-4 py-3 rounded-xl min-w-[300px] max-w-md pointer-events-auto"
            style={{
                background: 'rgba(26, 34, 53, 0.9)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${borderColors[type]}`,
                boxShadow: 'var(--fc-shadow-lg)',
                fontFamily: 'var(--fc-font-sans)',
            }}
        >
            <div className="flex-shrink-0">
                {icons[type]}
            </div>
            <p className="flex-1 text-sm font-medium" style={{ color: 'var(--fc-text-primary)' }}>
                {message}
            </p>
            <button
                onClick={onClose}
                className="p-1 rounded-full transition-colors"
                style={{ color: 'var(--fc-text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
                <X size={16} />
            </button>
        </motion.div>
    );
};

export default Toast;
