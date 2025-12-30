import { motion } from 'framer-motion';

const Spinner = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <motion.div
                className={`${sizes[size]} relative`}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
                <div className="absolute inset-0 rounded-full border-4 border-primary-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 border-r-primary-500"></div>
            </motion.div>
        </div>
    );
};

export default Spinner;
