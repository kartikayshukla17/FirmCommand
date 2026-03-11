import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'large' }) => {
    const getSize = () => {
        switch (size) {
            case 'small': return { wh: 'w-6 h-6', border: '2px' };
            case 'medium': return { wh: 'w-10 h-10', border: '3px' };
            case 'large': return { wh: 'w-16 h-16', border: '4px' };
            default: return { wh: 'w-16 h-16', border: '4px' };
        }
    };

    const s = getSize();

    return (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
            <div
                className={`${s.wh} rounded-full`}
                style={{
                    border: `${s.border} solid rgba(200, 169, 110, 0.15)`,
                    borderTopColor: 'var(--fc-brass)',
                    animation: 'fc-spin 0.8s linear infinite',
                }}
            />
            {size === 'large' && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    style={{ marginTop: '1rem', color: 'var(--fc-text-muted)', fontWeight: 500, fontFamily: 'var(--fc-font-sans)', fontSize: '0.875rem' }}
                >
                    Loading...
                </motion.p>
            )}
        </div>
    );
};

export default LoadingSpinner;
