import { createContext, useContext, useState, useRef, useCallback } from 'react';
import ConfirmationModal from '../components/ConfirmationModal';

const ConfirmationContext = createContext();

export const useConfirm = () => {
    const context = useContext(ConfirmationContext);
    if (!context) throw new Error('useConfirm must be used within a ConfirmationProvider');
    return context;
};

export const ConfirmationProvider = ({ children }) => {
    const [dialog, setDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'danger',
        confirmText: 'Confirm',
        cancelText: 'Cancel'
    });

    const resolver = useRef(null);

    const confirm = useCallback(({ title, message, type = 'danger', confirmText, cancelText }) => {
        setDialog({
            isOpen: true,
            title,
            message,
            type,
            confirmText: confirmText || 'Confirm',
            cancelText: cancelText || 'Cancel'
        });

        return new Promise((resolve) => {
            resolver.current = resolve;
        });
    }, []);

    const handleConfirm = () => {
        if (resolver.current) resolver.current(true);
        setDialog(prev => ({ ...prev, isOpen: false }));
    };

    const handleCancel = () => {
        if (resolver.current) resolver.current(false);
        setDialog(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <ConfirmationContext.Provider value={{ confirm }}>
            {children}
            <ConfirmationModal
                isOpen={dialog.isOpen}
                onClose={handleCancel}
                onConfirm={handleConfirm}
                title={dialog.title}
                message={dialog.message}
                type={dialog.type}
                confirmText={dialog.confirmText}
                cancelText={dialog.cancelText}
            />
        </ConfirmationContext.Provider>
    );
};
