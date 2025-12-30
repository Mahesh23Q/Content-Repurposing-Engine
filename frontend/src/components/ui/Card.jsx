import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = false, ...props }) => {
    const baseClass = hover ? 'glass-card-hover' : 'glass-card';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`${baseClass} p-6 ${className}`}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const CardHeader = ({ children, className = '' }) => (
    <div className={`mb-4 ${className}`}>
        {children}
    </div>
);

export const CardTitle = ({ children, className = '' }) => (
    <h3 className={`text-xl font-bold text-white ${className}`}>
        {children}
    </h3>
);

export const CardDescription = ({ children, className = '' }) => (
    <p className={`text-sm text-gray-400 mt-1 ${className}`}>
        {children}
    </p>
);

export const CardContent = ({ children, className = '' }) => (
    <div className={className}>
        {children}
    </div>
);

export const CardFooter = ({ children, className = '' }) => (
    <div className={`mt-6 flex items-center justify-between ${className}`}>
        {children}
    </div>
);

export default Card;
