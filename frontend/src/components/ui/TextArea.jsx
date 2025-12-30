import { forwardRef } from 'react';

const TextArea = forwardRef(({
    label,
    error,
    className = '',
    rows = 4,
    ...props
}, ref) => {
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                rows={rows}
                className={`input-field resize-none custom-scrollbar ${error ? 'ring-2 ring-red-500' : ''}`}
                {...props}
            />
            {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
        </div>
    );
});

TextArea.displayName = 'TextArea';

export default TextArea;
