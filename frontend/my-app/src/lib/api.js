import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important for cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                await api.post('/auth/refresh');
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, redirect to login
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Auth API functions
export const authAPI = {
    // Register new user
    register: async (name, email, password, role = 'student') => {
        return api.post('/auth/register', { name, email, password, role });
    },

    // Login user
    login: async (email, password) => {
        return api.post('/auth/login', { email, password });
    },

    // Logout user
    logout: async () => {
        return api.post('/auth/logout');
    },

    // Get current user
    getCurrentUser: async () => {
        return api.get('/auth/me');
    },

    // Refresh token
    refreshToken: async () => {
        return api.post('/auth/refresh');
    },

    // Verify email
    verifyEmail: async (token) => {
        return api.get(`/auth/verify-email/${token}`);
    },

    // Forgot password
    forgotPassword: async (email) => {
        return api.post('/auth/forgot-password', { email });
    },

    // Reset password
    resetPassword: async (token, password, confirmPassword) => {
        return api.post('/auth/reset-password', { token, password, confirmPassword });
    },

    // Change password
    changePassword: async (currentPassword, newPassword, confirmPassword) => {
        return api.post('/auth/change-password', { currentPassword, newPassword, confirmPassword });
    },

    // Update profile
    updateProfile: async (name) => {
        return api.put('/auth/profile', { name });
    },
};

export default api;
