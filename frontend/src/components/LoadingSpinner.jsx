import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'large' }) => {
    const getSize = () => {
        switch (size) {
            case 'small': return 'w-6 h-6 border-2';
            case 'medium': return 'w-10 h-10 border-3';
            case 'large': return 'w-16 h-16 border-4';
            default: return 'w-16 h-16 border-4';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className={`${getSize()} border-blue-500/30 border-t-blue-600 rounded-full`}
            />
            {size === 'large' && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-4 text-gray-500 dark:text-gray-400 font-medium"
                >
                    Loading...
                </motion.p>
            )}
        </div>
    );
};

export default LoadingSpinner;
