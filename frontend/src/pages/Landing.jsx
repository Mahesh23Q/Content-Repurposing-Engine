import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Target, TrendingUp, ArrowRight, CheckCircle, Rocket, Star } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
    const { isAuthenticated } = useAuth();

    const platforms = [
        { name: 'LinkedIn', emoji: '💼', color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/50' },
        { name: 'Twitter', emoji: '🐦', color: 'from-sky-500 to-sky-600', shadow: 'shadow-sky-500/50' },
        { name: 'Blog', emoji: '📝', color: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/50' },
        { name: 'Email', emoji: '✉️', color: 'from-pink-500 to-pink-600', shadow: 'shadow-pink-500/50' },
    ];

    // Floating particle animation
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 10 + 20,
        delay: Math.random() * 5,
    }));

    return (
        <div className="h-screen w-screen overflow-hidden relative">
            {/* Animated Particle Background */}
            <div className="absolute inset-0 overflow-hidden">
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        className="absolute rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 opacity-20"
                        style={{
                            width: particle.size,
                            height: particle.size,
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                            duration: particle.duration,
                            repeat: Infinity,
                            delay: particle.delay,
                        }}
                    />
                ))}
            </div>

            {/* Enhanced Gradient Orbs */}
            <motion.div
                className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-primary-500/30 via-purple-500/20 to-transparent rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 90, 0],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 15, repeat: Infinity }}
            />
            <motion.div
                className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-gradient-to-tl from-secondary-500/30 via-pink-500/20 to-transparent rounded-full blur-3xl"
                animate={{
                    scale: [1.2, 1, 1.2],
                    rotate: [0, -90, 0],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 18, repeat: Infinity }}
            />
            <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-accent-500/10 via-primary-500/20 to-secondary-500/10 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 20, repeat: Infinity }}
            />

            {/* Main Content */}
            <div className="relative h-screen flex items-center justify-center px-4">
                <div className="max-w-6xl mx-auto text-center">
                    {/* Badge with animation */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className="inline-flex items-center space-x-2 glass-card px-5 py-2.5 rounded-full mb-8 shadow-lg shadow-primary-500/20 border border-primary-500/20"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                            <Sparkles className="w-4 h-4 text-primary-400" />
                        </motion.div>
                        <span className="text-sm font-medium bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                            AI-Powered Content Transformation
                        </span>
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </motion.div>

                    {/* Main Heading with stagger effect */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
                        >
                            <span className="inline-block bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent animate-gradient bg-300%">
                                Repurpose
                            </span>
                            <br />
                            <motion.span
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="inline-block text-white text-shadow-lg"
                            >
                                Content
                            </motion.span>{' '}
                            <motion.span
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                                className="inline-block bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
                            >
                                Everywhere
                            </motion.span>
                        </motion.h1>
                    </motion.div>

                    {/* Subheading */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                        className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto font-light leading-relaxed"
                    >
                        Transform your content into platform-perfect posts with{' '}
                        <span className="text-primary-400 font-semibold">AI magic</span>.
                        <br className="hidden md:block" />
                        LinkedIn, Twitter, Blogs, Emails — all in{' '}
                        <span className="text-secondary-400 font-semibold">under 2 minutes</span>.
                    </motion.p>

                    {/* CTA Buttons with hover effects */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.9 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-12"
                    >
                        <Link to={isAuthenticated ? '/dashboard' : '/register'}>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="shadow-2xl shadow-primary-500/50 hover:shadow-primary-500/70 transition-shadow"
                                    icon={<Rocket className="w-5 h-5" />}
                                >
                                    {isAuthenticated ? 'Go to Dashboard' : 'Start Creating Free'}
                                </Button>
                            </motion.div>
                        </Link>
                        <Link to="/upload">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="glass-card hover:bg-white/10 border-2 border-primary-500/40"
                                    icon={<ArrowRight className="w-5 h-5" />}
                                >
                                    See It In Action
                                </Button>
                            </motion.div>
                        </Link>
                    </motion.div>

                    {/* Platform Pills - Enhanced */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.1 }}
                        className="flex flex-wrap items-center justify-center gap-4"
                    >
                        {platforms.map((platform, index) => (
                            <motion.div
                                key={platform.name}
                                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{
                                    duration: 0.5,
                                    delay: 1.2 + index * 0.1,
                                    type: "spring",
                                    stiffness: 200
                                }}
                                whileHover={{
                                    scale: 1.15,
                                    rotate: [0, -5, 5, -5, 0],
                                    transition: { duration: 0.3 }
                                }}
                                className={`glass-card px-5 py-3 rounded-2xl flex items-center space-x-3 cursor-pointer
                                    bg-gradient-to-r ${platform.color} bg-opacity-10 border border-white/20
                                    shadow-lg ${platform.shadow} hover:shadow-xl hover:border-white/40 transition-all`}
                            >
                                <motion.span
                                    className="text-2xl"
                                    animate={{ rotate: [0, 10, -10, 10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                                >
                                    {platform.emoji}
                                </motion.span>
                                <span className="font-semibold text-white text-sm">{platform.name}</span>
                                <motion.div
                                    className="w-2 h-2 rounded-full bg-green-400"
                                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                                />
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Trust indicators */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-400"
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span>No Credit Card</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span>90s Processing</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-purple-400 fill-purple-400" />
                            <span>GPT-4 Powered</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Landing;
