import { STATUS_INFO } from '../../utils/constants';

const Badge = ({ status, children, className = '' }) => {
    if (status) {
        const statusClass = `status-${status}`;
        const info = STATUS_INFO[status] || STATUS_INFO.pending;

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusClass} ${className}`}>
                <span className="mr-1">{info.icon}</span>
                {children || info.label}
            </span>
        );
    }

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold glass-card ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
