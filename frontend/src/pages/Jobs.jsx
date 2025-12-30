import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RefreshCw,
    Filter,
    Search,
    Calendar,
    Clock,
    FileText,
    Eye,
    Download,
    XCircle,
    Trash2,
    AlertTriangle
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Input from '../components/ui/Input';
import JobResultsModal from '../components/JobResultsModal';
import Modal from '../components/ui/Modal';
import api from '../config/api';
import { API_ENDPOINTS, STATUS_INFO, PLATFORM_INFO, JOB_STATUS } from '../utils/constants';
import toast from 'react-hot-toast';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
    });

    useEffect(() => {
        fetchJobs();

        // Auto-refresh every 10 seconds if there are processing jobs
        const interval = setInterval(() => {
            const hasProcessing = jobs.some(
                job => job.status === JOB_STATUS.PENDING || job.status === JOB_STATUS.PROCESSING
            );
            if (hasProcessing) {
                fetchJobs(true);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [pagination.page, statusFilter]);

    const fetchJobs = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            else setRefreshing(true);

            const params = {
                page: pagination.page,
                limit: pagination.limit,
            };

            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }

            const response = await api.get(API_ENDPOINTS.JOBS, { params });

            setJobs(response.data.items || []);
            setPagination(prev => ({
                ...prev,
                total: response.data.total,
            }));
        } catch (error) {
            console.error('Fetch jobs error:', error);
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleViewResults = (jobId) => {
        setSelectedJobId(jobId);
        setShowResultsModal(true);
    };

    const handleDownloadResults = async (jobId) => {
        try {
            const response = await api.get(API_ENDPOINTS.JOB_OUTPUTS(jobId));
            const outputs = response.data.outputs;
            
            // Create downloadable content
            let downloadContent = `Content Results - Job ${jobId}\n`;
            downloadContent += `Generated on: ${new Date().toLocaleString()}\n`;
            downloadContent += `${'='.repeat(50)}\n\n`;
            
            Object.entries(outputs).forEach(([platform, output]) => {
                downloadContent += `${platform.toUpperCase()}\n`;
                downloadContent += `${'-'.repeat(platform.length)}\n`;
                
                if (platform === 'linkedin') {
                    downloadContent += `${output.content.post}\n\n`;
                    if (output.content.hashtags) {
                        downloadContent += `Hashtags: ${output.content.hashtags.join(' ')}\n`;
                    }
                } else if (platform === 'twitter') {
                    output.content.tweets?.forEach((tweet) => {
                        downloadContent += `Tweet ${tweet.number}: ${tweet.text}\n`;
                    });
                } else if (platform === 'blog') {
                    downloadContent += `Title: ${output.content.title}\n\n`;
                    downloadContent += `${output.content.content}\n`;
                } else if (platform === 'email') {
                    output.content.emails?.forEach((email) => {
                        downloadContent += `Email ${email.number} - Subject: ${email.subject}\n`;
                        downloadContent += `${email.content}\n\n`;
                    });
                }
                
                downloadContent += `\n${'='.repeat(50)}\n\n`;
            });
            
            // Create and download file
            const blob = new Blob([downloadContent], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `content-results-${jobId}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            toast.success('Results downloaded successfully');
            
        } catch (error) {
            console.error('Download results error:', error);
            toast.error('Failed to download results');
        }
    };

    const handleCancelJob = async (jobId) => {
        try {
            await api.post(API_ENDPOINTS.JOB_CANCEL(jobId));
            toast.success('Job cancelled successfully');
            fetchJobs(true);
        } catch (error) {
            toast.error('Failed to cancel job');
        }
    };

    const handleDeleteJob = (job) => {
        setDeleteTarget(job);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            setDeleting(true);
            await api.delete(API_ENDPOINTS.JOB_DELETE(deleteTarget.id));
            toast.success('Job deleted successfully');
            setShowDeleteModal(false);
            setDeleteTarget(null);
            fetchJobs(true);
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete job');
        } finally {
            setDeleting(false);
        }
    };

    const filteredJobs = jobs.filter(job =>
        !searchQuery ||
        job.content?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const statusOptions = [
        { value: 'all', label: 'All Jobs' },
        { value: JOB_STATUS.PENDING, label: 'Pending' },
        { value: JOB_STATUS.PROCESSING, label: 'Processing' },
        { value: JOB_STATUS.COMPLETED, label: 'Completed' },
        { value: JOB_STATUS.FAILED, label: 'Failed' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <Spinner size="xl" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-bold gradient-text"
                        >
                            Content Jobs
                        </motion.h1>
                        <Button
                            variant="outline"
                            icon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
                            onClick={() => fetchJobs(true)}
                            disabled={refreshing}
                        >
                            Refresh
                        </Button>
                    </div>
                    <p className="text-gray-400">
                        Track and manage all your content processing jobs
                    </p>
                </div>

                {/* Filters and Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <Card className="glass-card">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search jobs..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div className="flex gap-2">
                                {statusOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setStatusFilter(option.value);
                                            setPagination(prev => ({ ...prev, page: 1 }));
                                        }}
                                        className={`px-4 py-2 rounded-xl font-medium transition-all ${statusFilter === option.value
                                                ? 'bg-primary-500 text-white'
                                                : 'glass-card hover:bg-white/10'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Jobs List */}
                {filteredJobs.length === 0 ? (
                    <Card className="glass-card text-center py-16">
                        <FileText className="w-20 h-20 mx-auto mb-4 text-gray-600" />
                        <h3 className="text-2xl font-semibold mb-2">
                            {searchQuery ? 'No matching jobs' : 'No jobs yet'}
                        </h3>
                        <p className="text-gray-400 mb-6">
                            {searchQuery
                                ? 'Try adjusting your search or filters'
                                : 'Upload content to create your first job'}
                        </p>
                        {!searchQuery && (
                            <Link to="/upload">
                                <Button variant="primary">
                                    Upload Content
                                </Button>
                            </Link>
                        )}
                    </Card>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {filteredJobs.map((job, index) => {
                                const statusInfo = STATUS_INFO[job.status] || STATUS_INFO.pending;
                                const isProcessing = job.status === JOB_STATUS.PENDING || job.status === JOB_STATUS.PROCESSING;

                                return (
                                    <motion.div
                                        key={job.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.05 }}
                                        layout
                                    >
                                        <Card className="glass-card-hover">
                                            <div className="flex items-start justify-between gap-4">
                                                {/* Job Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <h3 className="text-xl font-semibold truncate">
                                                            {job.title || 'Processing...'}
                                                        </h3>
                                                        <span className={`status-${job.status} px-3 py-1 rounded-full text-xs whitespace-nowrap`}>
                                                            {statusInfo.icon} {statusInfo.label}
                                                        </span>
                                                        {isProcessing && (
                                                            <Spinner size="sm" />
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            {new Date(job.created_at).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {new Date(job.created_at).toLocaleTimeString()}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <FileText className="w-4 h-4" />
                                                            {job.content?.source_type?.toUpperCase() || 'FILE'}
                                                        </div>
                                                    </div>

                                                    {/* Platforms */}
                                                    <div className="flex flex-wrap gap-2">
                                                        {job.platforms?.map((platform) => {
                                                            const platformInfo = PLATFORM_INFO[platform] || {};
                                                            return (
                                                                <div
                                                                    key={platform}
                                                                    className={`platform-badge bg-gradient-to-r ${platformInfo.color}`}
                                                                >
                                                                    <span>{platformInfo.icon}</span>
                                                                    <span>{platformInfo.name}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Error Message */}
                                                    {job.status === JOB_STATUS.FAILED && job.error_message && (
                                                        <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                                            <p className="text-sm text-red-400">
                                                                Error: {job.error_message}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    {job.status === JOB_STATUS.COMPLETED && (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                icon={<Eye className="w-4 h-4" />}
                                                                title="View Results"
                                                                onClick={() => handleViewResults(job.id)}
                                                                className="hover:bg-primary-500/20 hover:border-primary-500/50 hover:text-primary-300 transition-all duration-200"
                                                            >
                                                                View
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                icon={<Download className="w-4 h-4" />}
                                                                title="Download"
                                                                onClick={() => handleDownloadResults(job.id)}
                                                                className="hover:bg-green-500/20 hover:border-green-500/50 hover:text-green-300 transition-all duration-200"
                                                            >
                                                                Download
                                                            </Button>
                                                        </>
                                                    )}

                                                    {isProcessing && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            icon={<XCircle className="w-4 h-4" />}
                                                            onClick={() => handleCancelJob(job.id)}
                                                            className="text-red-400 hover:text-red-300"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    )}

                                                    {/* Delete button for completed, failed, or cancelled jobs */}
                                                    {(job.status === JOB_STATUS.COMPLETED || 
                                                      job.status === JOB_STATUS.FAILED || 
                                                      job.status === JOB_STATUS.CANCELLED) && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            icon={<Trash2 className="w-4 h-4" />}
                                                            title="Delete Job"
                                                            onClick={() => handleDeleteJob(job)}
                                                            className="text-red-400 hover:text-red-300 hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-200"
                                                        >
                                                            Delete
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

                {/* Pagination */}
                {pagination.total > pagination.limit && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 flex justify-center gap-2"
                    >
                        <Button
                            variant="outline"
                            disabled={pagination.page === 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        >
                            Previous
                        </Button>
                        <span className="px-4 py-2 text-gray-400">
                            Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                        </span>
                        <Button
                            variant="outline"
                            disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        >
                            Next
                        </Button>
                    </motion.div>
                )}
            </div>

            {/* Results Modal */}
            <JobResultsModal
                isOpen={showResultsModal}
                onClose={() => {
                    setShowResultsModal(false);
                    setSelectedJobId(null);
                }}
                jobId={selectedJobId}
            />

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeleteTarget(null);
                }}
                title="Confirm Delete"
                size="md"
            >
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                        <div>
                            <h3 className="text-lg font-semibold text-white">
                                Delete Job
                            </h3>
                            <p className="text-gray-400">
                                Are you sure you want to delete this job?
                            </p>
                        </div>
                    </div>

                    {deleteTarget && (
                        <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`status-${deleteTarget.status} px-2 py-1 rounded text-xs`}>
                                    {STATUS_INFO[deleteTarget.status]?.icon} {STATUS_INFO[deleteTarget.status]?.label}
                                </span>
                            </div>
                            <h4 className="font-medium text-white">
                                {deleteTarget.content?.title || 'Untitled Content'}
                            </h4>
                            <p className="text-sm text-gray-400">
                                Created: {new Date(deleteTarget.created_at).toLocaleString()}
                            </p>
                        </div>
                    )}

                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                        <p className="text-sm text-red-300">
                            <strong>Warning:</strong> This action cannot be undone. The job and all its results will be permanently deleted.
                        </p>
                    </div>

                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowDeleteModal(false);
                                setDeleteTarget(null);
                            }}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={confirmDelete}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleting ? (
                                <>
                                    <Spinner size="sm" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    Delete Job
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Jobs;
