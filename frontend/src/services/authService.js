import { authAPI } from './api';

class AuthService {
    // Login user
    async login(email, password) {
        try {
            const response = await authAPI.login({ email, password });

            if (response.data.success) {
                const { user, tokens } = response.data.data;
                this.setTokens(tokens);
                return { success: true, user };
            }

            return { success: false, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Login failed. Please try again.'
            };
        }
    }

    // Register user
    async register(userData) {
        try {
            const response = await authAPI.register(userData);

            if (response.data.success) {
                const { user, tokens } = response.data.data;
                this.setTokens(tokens);
                return { success: true, user };
            }

            return { success: false, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Registration failed. Please try again.'
            };
        }
    }

    // Forgot password
    async forgotPassword(email) {
        try {
            const response = await authAPI.forgotPassword(email);
            return {
                success: response.data.success,
                message: response.data.message
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to send reset email.'
            };
        }
    }

    // Set tokens in localStorage
    setTokens(tokens) {
        if (tokens.accessToken) {
            localStorage.setItem('accessToken', tokens.accessToken);
        }
        if (tokens.refreshToken) {
            localStorage.setItem('refreshToken', tokens.refreshToken);
        }
    }

    // Get access token
    getAccessToken() {
        return localStorage.getItem('accessToken');
    }

    // Get refresh token
    getRefreshToken() {
        return localStorage.getItem('refreshToken');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getAccessToken();
    }

    // Get user role from token (basic implementation)
    getUserRole() {
        const token = this.getAccessToken();
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.role;
        } catch (error) {
            console.error('Error parsing token:', error);
            return null;
        }
    }

    // Logout
    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }

    // Validate token (check expiration)
    isTokenValid() {
        const token = this.getAccessToken();
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry = payload.exp * 1000; // Convert to milliseconds
            return Date.now() < expiry;
        } catch (error) {
            console.error('Error validating token:', error);
            return false;
        }
    }

    // Refresh token
    async refreshToken() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await authAPI.refreshToken({ refreshToken });

            if (response.data.success) {
                const { tokens } = response.data.data;
                this.setTokens(tokens);
                return tokens;
            }

            throw new Error(response.data.message);
        } catch (error) {
            this.logout();
            throw error;
        }
    }
}

export default new AuthService();