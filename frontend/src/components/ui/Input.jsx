import { forwardRef } from 'react';

const Input = forwardRef(({
    label,
    error,
    icon,
    className = '',
    type = 'text',
    ...props
}, ref) => {
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        {icon}
                    </div>
                )}
                <input
                    ref={ref}
                    type={type}
                    className={`input-field ${icon ? 'pl-12' : ''} ${error ? 'ring-2 ring-red-500' : ''}`}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
