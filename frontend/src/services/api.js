import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post('/api/auth/refresh-token', {
                        refreshToken
                    });

                    const { accessToken } = response.data.data.tokens;
                    localStorage.setItem('accessToken', accessToken);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Handle other errors
        if (error.response?.data) {
            return Promise.reject(error.response.data);
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken })
};

// User API
export const userAPI = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (profileData) => api.put('/users/profile', profileData),
    changePassword: (passwordData) => api.put('/users/change-password', passwordData),
    getAllUsers: (params) => api.get('/users/all', { params }),
    getUserStats: () => api.get('/users/stats'),
    updateUserRole: (userId, role) => api.put(`/users/${userId}/role`, { role }),
    deleteUser: (userId) => api.delete(`/users/${userId}`)
};

// Vehicle API
export const vehicleAPI = {
    getAllVehicles: (params) => api.get('/vehicles', { params }),
    getVehicleById: (id) => api.get(`/vehicles/${id}`),
    getVehiclesByUserId: (userId) => api.get(`/vehicles/user/${userId}`),
    getVehicleStats: () => api.get('/vehicles/stats'),
    updateVehicle: (id, vehicleData) => api.put(`/vehicles/${id}`, vehicleData),
    deleteVehicle: (id) => api.delete(`/vehicles/${id}`),
    searchVehicles: (query) => api.get(`/vehicles/search/${query}`)
};

// Traffic API
export const trafficAPI = {
    getAllZones: (params) => api.get('/traffic', { params }),
    getZoneById: (id) => api.get(`/traffic/${id}`),
    getNearbyZones: (params) => api.get('/traffic/nearby', { params }),
    getAnalytics: () => api.get('/traffic/analytics'),
    createZone: (zoneData) => api.post('/traffic', zoneData),
    updateZone: (id, zoneData) => api.put(`/traffic/${id}`, zoneData),
    deleteZone: (id) => api.delete(`/traffic/${id}`),
    simulateUpdate: () => api.post('/traffic/simulate'),
    bulkCreateZones: (zones) => api.post('/traffic/bulk', { zones }),
    searchZones: (query) => api.get(`/traffic/search/${query}`)
};

// Health check
export const healthAPI = {
    check: () => api.get('/health')
};

export default api;