import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger', confirmText = 'Confirm', cancelText = 'Cancel' }) => {
    if (!isOpen) return null;

    const icons = {
        danger: <AlertTriangle className="text-red-500" size={32} />,
        info: <Info className="text-blue-500" size={32} />,
        success: <CheckCircle className="text-emerald-500" size={32} />
    };

    const confirmColors = {
        danger: 'bg-red-600 hover:bg-red-500 border-red-500/20 text-white',
        info: 'bg-blue-600 hover:bg-blue-500 border-blue-500/20 text-white',
        success: 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500/20 text-white'
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 w-full max-w-md p-6 overflow-hidden"
            >
                <div className="flex flex-col items-center text-center">
                    <div className={`p-4 rounded-full bg-zinc-800/50 border mb-4 ${type === 'danger' ? 'border-red-500/20 bg-red-500/10' : 'border-zinc-700'}`}>
                        {icons[type]}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium transition-colors border border-zinc-700"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 py-2.5 rounded-lg font-medium transition-colors border shadow-lg ${confirmColors[type]}`}
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
