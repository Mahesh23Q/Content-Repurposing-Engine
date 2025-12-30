import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload as UploadIcon,
    X,
    Check,
    Sparkles,
    Loader2
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../config/api';
import { API_ENDPOINTS, PLATFORM_INFO, FILE_TYPE_INFO, MAX_FILE_SIZE } from '../utils/constants';
import toast from 'react-hot-toast';

const Upload = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [selectedPlatforms, setSelectedPlatforms] = useState(['linkedin', 'twitter', 'blog']);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleFileSelect = (selectedFile) => {
        // Validate file type
        const fileType = selectedFile.type;
        const validTypes = Object.keys(FILE_TYPE_INFO);

        if (!validTypes.includes(fileType)) {
            toast.error('Invalid file type. Please upload PDF, DOCX, PPTX, or TXT files.');
            return;
        }

        // Validate file size
        if (selectedFile.size > MAX_FILE_SIZE) {
            toast.error('File too large. Maximum size is 50MB.');
            return;
        }

        setFile(selectedFile);
        toast.success('File selected successfully!');
    };

    const removeFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const togglePlatform = (platform) => {
        setSelectedPlatforms(prev =>
            prev.includes(platform)
                ? prev.filter(p => p !== platform)
                : [...prev, platform]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            toast.error('Please select a file to upload');
            return;
        }

        if (selectedPlatforms.length === 0) {
            toast.error('Please select at least one platform');
            return;
        }

        try {
            setUploading(true);
            setUploadProgress(0);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('platforms', JSON.stringify(selectedPlatforms));
            formData.append('preferences', JSON.stringify({}));

            await api.post(API_ENDPOINTS.CONTENT_UPLOAD, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                },
            });

            toast.success('Content uploaded successfully!');

            // Navigate to jobs page after short delay
            setTimeout(() => {
                navigate('/jobs');
            }, 1500);

        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.detail || 'Failed to upload content');
        } finally {
            setUploading(false);
        }
    };

    const getFileIcon = (fileType) => {
        if (fileType?.includes('pdf')) return '📄';
        if (fileType?.includes('word')) return '📝';
        if (fileType?.includes('presentation')) return '📊';
        return '📋';
    };

    return (
        <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold mb-2 gradient-text">Upload Content</h1>
                    <p className="text-gray-400">
                        Upload your content and we'll transform it for multiple platforms
                    </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* File Upload Area */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="glass-card">
                            <h2 className="text-xl font-semibold mb-4">Select File</h2>

                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${dragActive
                                        ? 'border-primary-500 bg-primary-500/10'
                                        : 'border-gray-700 hover:border-gray-600'
                                    }`}
                            >
                                {!file ? (
                                    <>
                                        <UploadIcon className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                                        <h3 className="text-xl font-semibold mb-2">
                                            Drop your file here, or{' '}
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-primary-400 hover:text-primary-300 underline"
                                            >
                                                browse
                                            </button>
                                        </h3>
                                        <p className="text-gray-400 mb-4">
                                            Supports: PDF, DOCX, PPTX, TXT (max 50MB)
                                        </p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            onChange={handleFileInput}
                                            accept=".pdf,.docx,.pptx,.txt"
                                            className="hidden"
                                        />
                                    </>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center justify-between glass-card p-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-4xl">{getFileIcon(file.type)}</span>
                                            <div className="text-left">
                                                <h4 className="font-semibold">{file.name}</h4>
                                                <p className="text-sm text-gray-400">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeFile}
                                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5 text-red-400" />
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </Card>
                    </motion.div>

                    {/* Platform Selection */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="glass-card">
                            <h2 className="text-xl font-semibold mb-4">Select Platforms</h2>
                            <p className="text-gray-400 mb-6">Choose where you want to repurpose your content</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(PLATFORM_INFO).map(([key, platform]) => {
                                    const isSelected = selectedPlatforms.includes(key);

                                    return (
                                        <motion.button
                                            key={key}
                                            type="button"
                                            onClick={() => togglePlatform(key)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`glass-card p-4 text-left transition-all ${isSelected
                                                    ? 'border-2 border-primary-500 bg-primary-500/10'
                                                    : 'border-2 border-transparent hover:border-gray-600'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{platform.icon}</span>
                                                    <h3 className="font-semibold">{platform.name}</h3>
                                                </div>
                                                <div
                                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                                            ? 'border-primary-500 bg-primary-500'
                                                            : 'border-gray-600'
                                                        }`}
                                                >
                                                    {isSelected && <Check className="w-4 h-4" />}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-400">{platform.description}</p>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {selectedPlatforms.length === 0 && (
                                <p className="text-sm text-red-400 mt-4">
                                    Please select at least one platform
                                </p>
                            )}
                        </Card>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex justify-end gap-4"
                    >
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => navigate('/dashboard')}
                            disabled={uploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            disabled={!file || selectedPlatforms.length === 0 || uploading}
                            icon={uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        >
                            {uploading ? `Uploading... ${uploadProgress}%` : 'Generate Content'}
                        </Button>
                    </motion.div>

                    {/* Upload Progress */}
                    <AnimatePresence>
                        {uploading && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <Card className="glass-card">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium">Uploading...</span>
                                        <span className="text-sm text-gray-400">{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${uploadProgress}%` }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </div>
        </div>
    );
};

export default Upload;
