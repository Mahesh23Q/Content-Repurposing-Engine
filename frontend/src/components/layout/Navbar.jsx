import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const profileRef = useRef(null);

    // Close profile dropdown when auth state changes (logout)
    useEffect(() => {
        if (!isAuthenticated) {
            setProfileOpen(false);
        }
    }, [isAuthenticated]);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };

        if (profileOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [profileOpen]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-30 glass-card border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="relative">
                            <Sparkles className="w-8 h-8 text-primary-400 group-hover:rotate-12 transition-transform duration-300" />
                            <motion.div
                                className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </div>
                        <span className="text-xl font-bold gradient-text hidden sm:block">
                            ContentForge
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    {isAuthenticated && (
                        <div className="hidden md:flex items-center space-x-6">
                            <Link
                                to="/dashboard"
                                className="text-gray-300 hover:text-white transition-colors font-medium"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/upload"
                                className="text-gray-300 hover:text-white transition-colors font-medium"
                            >
                                Upload
                            </Link>
                            <Link
                                to="/jobs"
                                className="text-gray-300 hover:text-white transition-colors font-medium"
                            >
                                Jobs
                            </Link>
                        </div>
                    )}

                    {/* Right side */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center space-x-2 glass-card px-4 py-2 rounded-xl hover:bg-white/10 transition-all"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">{user?.email?.split('@')[0]}</span>
                                </button>

                                <AnimatePresence>
                                    {profileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-2 w-48 glass-card py-2"
                                        >
                                            <Link
                                                to="/profile"
                                                className="flex items-center space-x-2 px-4 py-2 hover:bg-white/10 transition-colors"
                                                onClick={() => setProfileOpen(false)}
                                            >
                                                <User className="w-4 h-4" />
                                                <span>Profile</span>
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center space-x-2 px-4 py-2 hover:bg-white/10 transition-colors w-full text-left text-red-400"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Logout</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">
                                        Login
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button variant="primary" size="sm">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-white/10"
                    >
                        <div className="px-4 py-4 space-y-3">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/upload"
                                        className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Upload
                                    </Link>
                                    <Link
                                        to="/jobs"
                                        className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Jobs
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-red-400"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="primary" className="w-full">
                                            Get Started
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
