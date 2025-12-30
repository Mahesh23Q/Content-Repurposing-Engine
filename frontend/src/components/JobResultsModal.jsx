import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Copy, 
    Download, 
    Hash, 
    FileText,
    Mail
} from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Card from './ui/Card';
import Spinner from './ui/Spinner';
import api from '../config/api';
import { API_ENDPOINTS, PLATFORM_INFO } from '../utils/constants';
import toast from 'react-hot-toast';

const JobResultsModal = ({ isOpen, onClose, jobId }) => {
    const [outputs, setOutputs] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(null);

    useEffect(() => {
        if (isOpen && jobId) {
            fetchResults();
        }
    }, [isOpen, jobId]);

    const fetchResults = async () => {
        try {
            setLoading(true);
            const response = await api.get(API_ENDPOINTS.JOB_OUTPUTS(jobId));
            setOutputs(response.data.outputs);
            
            // Set first available platform as active tab
            const platforms = Object.keys(response.data.outputs);
            if (platforms.length > 0) {
                setActiveTab(platforms[0]);
            }
        } catch (error) {
            console.error('Fetch results error:', error);
            toast.error('Failed to load results');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Copied to clipboard!');
        } catch (error) {
            toast.error('Failed to copy');
        }
    };

    const downloadPlatformContent = (platform, content) => {
        let downloadText = '';
        
        if (platform === 'linkedin') {
            downloadText = content.post;
            if (content.hashtags) {
                downloadText += '\n\nHashtags: ' + content.hashtags.join(' ');
            }
        } else if (platform === 'twitter') {
            downloadText = content.tweets?.map(tweet => 
                `Tweet ${tweet.number}: ${tweet.text}`
            ).join('\n\n') || '';
        } else if (platform === 'blog') {
            downloadText = `${content.title}\n\n${content.content}`;
        } else if (platform === 'email') {
            downloadText = content.emails?.map(email => 
                `Subject: ${email.subject}\n\n${email.content}`
            ).join('\n\n---\n\n') || '';
        }

        const blob = new Blob([downloadText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${platform}-content.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast.success(`${platform} content downloaded!`);
    };

    const renderPlatformContent = (platform, content) => {
        const platformInfo = PLATFORM_INFO[platform] || {};

        switch (platform) {
            case 'linkedin':
                return (
                    <div className="space-y-6 max-h-80">
                        {/* Main Post Content */}
                        <div className="relative group">
                            <div className="p-6 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/20 backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-blue-400">LinkedIn Post</span>
                                </div>
                                <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                    <p className="text-gray-100 whitespace-pre-wrap leading-relaxed text-base">
                                        {content.post}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                icon={<Copy className="w-4 h-4" />}
                                onClick={() => copyToClipboard(content.post)}
                                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-blue-500/20"
                                title="Copy post content"
                            />
                        </div>
                        
                        {/* Hashtags */}
                        {content.hashtags && (
                            <div className="glass-card p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <Hash className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm font-medium text-blue-400">Hashtags</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {content.hashtags.map((tag, index) => (
                                        <motion.span 
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors cursor-pointer"
                                            onClick={() => copyToClipboard(tag)}
                                            title="Click to copy"
                                        >
                                            {tag}
                                        </motion.span>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Stats */}
                        {content.character_count && (
                            <div className="flex items-center justify-between glass-card p-4 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span className="text-sm text-gray-400">Character Count</span>
                                </div>
                                <span className="text-sm font-medium text-white">
                                    {content.character_count}/1300
                                </span>
                            </div>
                        )}
                    </div>
                );

            case 'twitter':
                return (
                    <div className="space-y-4 max-h-80">
                        {content.tweets?.map((tweet, index) => (
                            <motion.div 
                                key={index} 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative group"
                            >
                                <div className="p-6 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/20 backdrop-blur-sm hover:border-sky-500/30 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-sky-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-sky-400">
                                                Tweet {tweet.number}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${
                                                tweet.char_count <= 280 ? 'bg-green-400' : 'bg-red-400'
                                            }`}></div>
                                            <span className="text-xs text-gray-400">
                                                {tweet.char_count}/280
                                            </span>
                                        </div>
                                    </div>
                                    <div className="max-h-32 overflow-y-auto custom-scrollbar pr-2">
                                        <p className="text-gray-100 whitespace-pre-wrap leading-relaxed">
                                            {tweet.text}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={<Copy className="w-4 h-4" />}
                                    onClick={() => copyToClipboard(tweet.text)}
                                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-sky-500/20"
                                    title="Copy tweet"
                                />
                            </motion.div>
                        ))}
                    </div>
                );

            case 'blog':
                return (
                    <div className="space-y-6  max-h-80">
                        {/* Blog Title */}
                        <div className="relative group">
                            <div className="p-6 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/20 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-purple-400">Blog Title</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white leading-tight">
                                    {content.title}
                                </h3>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                icon={<Copy className="w-4 h-4" />}
                                onClick={() => copyToClipboard(content.title)}
                                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-purple-500/20"
                                title="Copy title"
                            />
                        </div>
                        
                        {/* Blog Content */}
                        <div className="relative group">
                            <div className="p-6 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/20 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-purple-400">Article Content</span>
                                </div>
                                <div className="prose prose-invert max-w-none max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                    <div className="text-gray-100 whitespace-pre-wrap leading-relaxed text-base">
                                        {content.content}
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                icon={<Copy className="w-4 h-4" />}
                                onClick={() => copyToClipboard(content.content)}
                                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-purple-500/20"
                                title="Copy content"
                            />
                        </div>
                        
                        {/* Meta Description */}
                        {content.meta_description && (
                            <div className="glass-card p-4 rounded-xl border-l-4 border-purple-500">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                    <span className="text-sm font-medium text-purple-400">Meta Description</span>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    {content.meta_description}
                                </p>
                            </div>
                        )}
                        
                        {/* Word Count */}
                        {content.word_count && (
                            <div className="flex items-center justify-between glass-card p-4 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span className="text-sm text-gray-400">Word Count</span>
                                </div>
                                <span className="text-sm font-medium text-white">
                                    {content.word_count} words
                                </span>
                            </div>
                        )}
                    </div>
                );

            case 'email':
                return (
                    <div className="space-y-6 max-h-80">
                        {content.emails?.map((email, index) => (
                            <motion.div 
                                key={index} 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative group"
                            >
                                <div className="p-6 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/20 backdrop-blur-sm hover:border-pink-500/30 transition-all duration-300">
                                    {/* Email Header */}
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-pink-500/20 rounded-lg">
                                            <Mail className="w-5 h-5 text-pink-400" />
                                        </div>
                                        <div>
                                            <span className="font-semibold text-pink-300 text-lg">
                                                Email {email.number}
                                            </span>
                                            {email.word_count && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                    <span className="text-xs text-gray-400">
                                                        {email.word_count} words
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Subject Line */}
                                    <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                                        <div className="text-sm font-medium text-pink-400 mb-2 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                                            Subject Line
                                        </div>
                                        <div className="text-white font-semibold text-lg">
                                            {email.subject}
                                        </div>
                                    </div>
                                    
                                    {/* Email Content */}
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                        <div className="text-sm font-medium text-pink-400 mb-3 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                                            Email Body
                                        </div>
                                        <p className="text-gray-100 whitespace-pre-wrap leading-relaxed text-base">
                                            {email.content}
                                        </p>
                                    </div>
                                </div>
                                
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={<Copy className="w-4 h-4" />}
                                    onClick={() => copyToClipboard(`Subject: ${email.subject}\n\n${email.content}`)}
                                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-pink-500/20"
                                    title="Copy email"
                                />
                            </motion.div>
                        ))}
                    </div>
                );

            default:
                return (
                    <div className="text-center py-8 text-gray-400">
                        <FileText className="w-12 h-12 mx-auto mb-2" />
                        <p>Content format not supported for preview</p>
                    </div>
                );
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Generated Content Results"
            size="xl"
        >
            <div className="p-6 max-h-[80vh] flex flex-col">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <Spinner size="lg" />
                            <p className="text-gray-400 mt-4">Loading your generated content...</p>
                        </div>
                    </div>
                ) : outputs ? (
                    <div className="flex flex-col h-full space-y-6">
                        {/* Platform Tabs */}
                        <div className="flex-shrink-0">
                            <div className="flex flex-wrap gap-3 border-b border-white/10 pb-6">
                                {Object.keys(outputs).map((platform) => {
                                    const platformInfo = PLATFORM_INFO[platform] || {};
                                    return (
                                        <motion.button
                                            key={platform}
                                            onClick={() => setActiveTab(platform)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                                                activeTab === platform
                                                    ? `bg-gradient-to-r ${platformInfo.color} text-white shadow-lg shadow-${platform}-500/30`
                                                    : 'glass-card hover:bg-white/10 text-gray-300 hover:text-white'
                                            }`}
                                        >
                                            <span className="text-xl">{platformInfo.icon}</span>
                                            <span className="font-semibold">{platformInfo.name}</span>
                                            <div className={`w-2 h-2 rounded-full ${
                                                activeTab === platform ? 'bg-white/30' : 'bg-green-400'
                                            }`} />
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Active Platform Content */}
                        {activeTab && outputs[activeTab] && (
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="flex-1 flex flex-col space-y-6 min-h-0"
                            >
                                {/* Platform Header with Actions */}
                                <div className="flex-shrink-0 flex items-center justify-between p-4 glass-card rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-gradient-to-r ${PLATFORM_INFO[activeTab]?.color}`}>
                                            <span className="text-xl">{PLATFORM_INFO[activeTab]?.icon}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">
                                                {PLATFORM_INFO[activeTab]?.name} Content
                                            </h3>
                                            <p className="text-sm text-gray-400">
                                                Ready to publish on {PLATFORM_INFO[activeTab]?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        icon={<Download className="w-4 h-4" />}
                                        onClick={() => downloadPlatformContent(activeTab, outputs[activeTab].content)}
                                        className="hover:bg-primary-500/20 hover:border-primary-500/50 hover:text-primary-300"
                                    >
                                        Download
                                    </Button>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
                                    {renderPlatformContent(activeTab, outputs[activeTab].content)}
                                </div>
                            </motion.div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="glass-card p-8 rounded-2xl max-w-md mx-auto">
                            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                            <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
                            <p className="text-gray-400">
                                The content generation might still be in progress or encountered an issue.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default JobResultsModal;