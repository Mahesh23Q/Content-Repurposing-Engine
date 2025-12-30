import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { register } = useAuth();
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};

        if (!fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        const result = await register(email, password, fullName);
        setLoading(false);

        if (result.success) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid opacity-10" />
            <motion.div
                className="absolute bottom-40 right-20 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 10, repeat: Infinity }}
            />

            <div className="relative w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 mb-4">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <h1 className="text-3xl font-bold gradient-text mb-2">Create Account</h1>
                            <p className="text-gray-400">
                                Start transforming your content today
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                label="Full Name"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                                icon={<User className="w-5 h-5" />}
                                error={errors.fullName}
                                required
                            />

                            <Input
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                icon={<Mail className="w-5 h-5" />}
                                error={errors.email}
                                required
                            />

                            <Input
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                icon={<Lock className="w-5 h-5" />}
                                error={errors.password}
                                required
                            />

                            <Input
                                label="Confirm Password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                icon={<Lock className="w-5 h-5" />}
                                error={errors.confirmPassword}
                                required
                            />

                            <div className="text-sm text-gray-400">
                                <label className="flex items-start space-x-2 cursor-pointer">
                                    <input type="checkbox" className="mt-1 rounded border-gray-600 bg-transparent" required />
                                    <span>
                                        I agree to the{' '}
                                        <Link to="/terms" className="text-primary-400 hover:text-primary-300">
                                            Terms of Service
                                        </Link>
                                        {' '}and{' '}
                                        <Link to="/privacy" className="text-primary-400 hover:text-primary-300">
                                            Privacy Policy
                                        </Link>
                                    </span>
                                </label>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full"
                                loading={loading}
                                icon={!loading && <ArrowRight className="w-5 h-5" />}
                            >
                                Create Account
                            </Button>
                        </form>

                        {/* Footer */}
                        <div className="mt-6 text-center">
                            <p className="text-gray-400">
                                Already have an account?{' '}
                                <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
