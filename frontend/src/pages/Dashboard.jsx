import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Upload,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp,
    Sparkles,
    ArrowRight
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import api from '../config/api';
import { API_ENDPOINTS, STATUS_INFO, PLATFORM_INFO } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentJobs, setRecentJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch analytics stats
            const analyticsResponse = await api.get(API_ENDPOINTS.ANALYTICS);
            setStats(analyticsResponse.data);

            // Fetch recent jobs
            const jobsResponse = await api.get(`${API_ENDPOINTS.JOBS}?page=1&limit=5`);
            setRecentJobs(jobsResponse.data.items || []);
        } catch (error) {
            console.error('Dashboard fetch error:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <Spinner size="xl" />
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Content',
            value: stats?.total_content || 0,
            icon: <FileText className="w-6 h-6" />,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-500/10',
        },
        {
            title: 'Total Jobs',
            value: stats?.total_jobs || 0,
            icon: <Clock className="w-6 h-6" />,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-500/10',
        },
        {
            title: 'Completed',
            value: stats?.completed_jobs || 0,
            icon: <CheckCircle className="w-6 h-6" />,
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-500/10',
        },
        {
            title: 'Processing',
            value: stats?.processing_jobs || 0,
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'from-orange-500 to-orange-600',
            bgColor: 'bg-orange-500/10',
        },
    ];

    return (
        <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold mb-2 gradient-text"
                    >
                        Welcome back, {user?.email?.split('@')[0]}! 👋
                    </motion.h1>
                    <p className="text-gray-400">Here's what's happening with your content</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {statCards.map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="glass-card-hover">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                                        <p className="text-3xl font-bold">{stat.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} ${stat.bgColor}`}>
                                        {stat.icon}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-12"
                >
                    <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link to="/upload">
                            <Card className="glass-card-hover cursor-pointer group">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                            <Upload className="w-5 h-5" />
                                            Upload New Content
                                        </h3>
                                        <p className="text-gray-400 text-sm">
                                            Upload PDF, DOCX, PPTX or paste text
                                        </p>
                                    </div>
                                    <ArrowRight className="w-6 h-6 text-primary-400 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </Card>
                        </Link>

                        <Link to="/jobs">
                            <Card className="glass-card-hover cursor-pointer group">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                            <Sparkles className="w-5 h-5" />
                                            View All Jobs
                                        </h3>
                                        <p className="text-gray-400 text-sm">
                                            Track and manage your content jobs
                                        </p>
                                    </div>
                                    <ArrowRight className="w-6 h-6 text-primary-400 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </Card>
                        </Link>
                    </div>
                </motion.div>

                {/* Recent Jobs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Recent Jobs</h2>
                        <Link to="/jobs">
                            <Button variant="ghost" size="sm">
                                View All
                            </Button>
                        </Link>
                    </div>

                    {recentJobs.length === 0 ? (
                        <Card className="glass-card text-center py-12">
                            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                            <h3 className="text-xl font-semibold mb-2">No jobs yet</h3>
                            <p className="text-gray-400 mb-6">
                                Upload your first content to get started
                            </p>
                            <Link to="/upload">
                                <Button variant="primary" icon={<Upload className="w-4 h-4" />}>
                                    Upload Content
                                </Button>
                            </Link>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {recentJobs.map((job, index) => {
                                const statusInfo = STATUS_INFO[job.status] || STATUS_INFO.pending;

                                return (
                                    <motion.div
                                        key={job.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + index * 0.1 }}
                                    >
                                        <Card className="glass-card-hover cursor-pointer">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="font-semibold">
                                                            {job.title || 'Untitled'}
                                                        </h3>
                                                        <span className={`status-${job.status} px-3 py-1 rounded-full text-xs`}>
                                                            {statusInfo.icon} {statusInfo.label}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                                        <span>{job.platforms?.length || 0} platforms</span>
                                                        <span>•</span>
                                                        <span>{new Date(job.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex gap-2 mt-2">
                                                        {job.platforms?.map((platform) => {
                                                            const platformInfo = PLATFORM_INFO[platform] || {};
                                                            return (
                                                                <span
                                                                    key={platform}
                                                                    className="platform-badge"
                                                                    title={platformInfo.name}
                                                                >
                                                                    {platformInfo.icon}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-gray-600" />
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
