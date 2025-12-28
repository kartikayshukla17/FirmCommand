import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Auto close after 5 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        error: <XCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />
    };

    const styles = {
        success: 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800',
        error: 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800',
        info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            layout
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md ${styles[type]} min-w-[300px] max-w-md pointer-events-auto`}
        >
            <div className="flex-shrink-0">
                {icons[type]}
            </div>
            <p className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                {message}
            </p>
            <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
                <X size={16} className="text-gray-500 dark:text-gray-400" />
            </button>
        </motion.div>
    );
};

export default Toast;
