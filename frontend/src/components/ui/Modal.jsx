import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    size = 'lg',
    showCloseButton = true 
}) => {
    // Close modal on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-7xl'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={`relative w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}
                    >
                        <div className="glass-card border border-white/10 shadow-2xl">
                            {/* Header */}
                            {(title || showCloseButton) && (
                                <div className="flex items-center justify-between p-6 border-b border-white/10">
                                    {title && (
                                        <h2 className="text-xl font-semibold text-white">
                                            {title}
                                        </h2>
                                    )}
                                    {showCloseButton && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            icon={<X className="w-5 h-5" />}
                                            onClick={onClose}
                                            className="text-gray-400 hover:text-white"
                                        />
                                    )}
                                </div>
                            )}

                            {/* Content */}
                            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;