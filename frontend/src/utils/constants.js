// API Endpoints
export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',

    // Content
    CONTENT_UPLOAD: '/content/upload',
    CONTENT_TEXT: '/content/text',
    CONTENT_URL: '/content/url',
    CONTENT: '/content',

    // Jobs
    JOBS: '/jobs',
    JOB_CANCEL: (id) => `/jobs/${id}/cancel`,
    JOB_DELETE: (id) => `/jobs/${id}`,

    // Outputs
    OUTPUTS: '/outputs',
    JOB_OUTPUTS: (jobId) => `/outputs/${jobId}/all`,
    OUTPUT_REGENERATE: (id) => `/outputs/${id}/regenerate`,

    // Analytics
    ANALYTICS: '/analytics/',
};

// Platform types
export const PLATFORMS = {
    LINKEDIN: 'linkedin',
    TWITTER: 'twitter',
    BLOG: 'blog',
    EMAIL: 'email',
};

export const PLATFORM_INFO = {
    linkedin: {
        name: 'LinkedIn',
        icon: '💼',
        color: 'from-blue-600 to-blue-500',
        description: 'Professional posts with hashtags',
        maxLength: 1300,
    },
    twitter: {
        name: 'Twitter',
        icon: '🐦',
        color: 'from-sky-600 to-sky-500',
        description: 'Engaging threads',
        maxLength: 280,
    },
    blog: {
        name: 'Blog',
        icon: '📝',
        color: 'from-purple-600 to-purple-500',
        description: 'SEO-optimized articles',
        maxLength: null,
    },
    email: {
        name: 'Email',
        icon: '✉️',
        color: 'from-pink-600 to-pink-500',
        description: 'Email sequences',
        maxLength: null,
    },
};

// File types
export const ALLOWED_FILE_TYPES = {
    PDF: '.pdf',
    DOCX: '.docx',
    PPTX: '.pptx',
    TXT: '.txt',
};

export const FILE_TYPE_INFO = {
    'application/pdf': { ext: '.pdf', name: 'PDF' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: '.docx', name: 'Word' },
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': { ext: '.pptx', name: 'PowerPoint' },
    'text/plain': { ext: '.txt', name: 'Text' },
};

// Job status
export const JOB_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
};

export const STATUS_INFO = {
    pending: {
        label: 'Pending',
        color: 'yellow',
        icon: '⏳',
    },
    processing: {
        label: 'Processing',
        color: 'blue',
        icon: '⚙️',
    },
    completed: {
        label: 'Completed',
        color: 'green',
        icon: '✅',
    },
    failed: {
        label: 'Failed',
        color: 'red',
        icon: '❌',
    },
    cancelled: {
        label: 'Cancelled',
        color: 'gray',
        icon: '🚫',
    },
};

// Content source types
export const SOURCE_TYPES = {
    FILE: 'file',
    TEXT: 'text',
    URL: 'url',
};

// Max file size (50MB)
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Polling interval for job status (5 seconds)
export const JOB_POLL_INTERVAL = 5000;
