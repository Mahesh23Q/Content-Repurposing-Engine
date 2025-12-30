import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="glass-card border-t border-white/10 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-xl font-bold gradient-text mb-4">ContentForge</h3>
                        <p className="text-gray-400 mb-4">
                            Transform your long-form content into platform-optimized posts with AI-powered intelligence.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="p-2 glass-card hover:bg-white/10 rounded-lg transition-all hover:scale-110">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 glass-card hover:bg-white/10 rounded-lg transition-all hover:scale-110">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 glass-card hover:bg-white/10 rounded-lg transition-all hover:scale-110">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 glass-card hover:bg-white/10 rounded-lg transition-all hover:scale-110">
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/features" className="text-gray-400 hover:text-white transition-colors">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link to="/docs" className="text-gray-400 hover:text-white transition-colors">
                                    Documentation
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/help" className="text-gray-400 hover:text-white transition-colors">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400 text-sm">
                    <p>&copy; {currentYear} ContentForge. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
