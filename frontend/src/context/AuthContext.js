import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('accessToken'));

    // Configure axios defaults
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                if (token) {
                    const response = await axios.get('/api/users/profile');
                    setUser(response.data.data.user);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                logout();
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await axios.post('/api/auth/login', { email, password });

            const { user, tokens } = response.data.data;
            const { accessToken, refreshToken } = tokens;

            // Store tokens
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            // Update state
            setToken(accessToken);
            setUser(user);

            return { success: true, user };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('/api/auth/register', userData);

            const { user, tokens } = response.data.data;
            const { accessToken, refreshToken } = tokens;

            // Store tokens
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            // Update state
            setToken(accessToken);
            setUser(user);

            return { success: true, user };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = () => {
        // Clear storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Clear state
        setUser(null);
        setToken(null);

        // Clear axios headers
        delete axios.defaults.headers.common['Authorization'];
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await axios.put('/api/users/profile', profileData);
            setUser(response.data.data.user);
            return { success: true, user: response.data.data.user };
        } catch (error) {
            console.error('Update profile error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Update failed'
            };
        }
    };

    const changePassword = async (passwordData) => {
        try {
            await axios.put('/api/users/change-password', passwordData);
            return { success: true };
        } catch (error) {
            console.error('Change password error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Password change failed'
            };
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};