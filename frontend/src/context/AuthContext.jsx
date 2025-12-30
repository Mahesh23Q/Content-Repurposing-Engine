import { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';
import { API_ENDPOINTS } from '../utils/constants';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if user is logged in on mount
        const token = localStorage.getItem('access_token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post(API_ENDPOINTS.LOGIN, { email, password });
            const { access_token, user: userData } = response.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            setIsAuthenticated(true);

            toast.success('Login successful!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.detail || 'Login failed';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const register = async (email, password, fullName) => {
        try {
            const response = await api.post(API_ENDPOINTS.REGISTER, {
                email,
                password,
                full_name: fullName,
            });
            const { access_token, user: userData } = response.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            setIsAuthenticated(true);

            toast.success('Registration successful!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.detail || 'Registration failed';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const logout = async () => {
        // Clear state immediately (optimistic update)
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');

        try {
            await api.post(API_ENDPOINTS.LOGOUT);
            toast.success('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            // Still show success since local state is cleared
            toast.success('Logged out successfully');
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
