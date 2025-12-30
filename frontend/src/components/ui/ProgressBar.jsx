import { motion } from 'framer-motion';

const ProgressBar = ({ progress, className = '', showLabel = true }) => {
    return (
        <div className={`w-full ${className}`}>
            {showLabel && (
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                </div>
            )}
            <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full"
                />
            </div>
        </div>
    );
};

export default ProgressBar;
