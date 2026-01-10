import api from './api';

// ========== PROFILE API ==========

export const connectAPI = {
    // Get current user's profile
    getProfile: async () => {
        const response = await api.get('/connect/profile');
        return response.data;
    },

    // Create or update profile
    updateProfile: async (profileData) => {
        const response = await api.post('/connect/profile', profileData);
        return response.data;
    },

    // Get another user's profile
    getPublicProfile: async (userId) => {
        const response = await api.get(`/connect/profile/${userId}`);
        return response.data;
    },

    // Update progress stats
    updateProgress: async (progressData) => {
        const response = await api.put('/connect/progress', progressData);
        return response.data;
    },

    // Update privacy settings
    updateSettings: async (settings) => {
        const response = await api.put('/connect/settings', settings);
        return response.data;
    },

    // ========== DISCOVERY API ==========

    // Discover potential partners
    discoverPartners: async (filters = {}, page = 1, limit = 20) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        if (filters.level) params.append('level', filters.level);
        if (filters.availability) params.append('availability', filters.availability);
        if (filters.mode) params.append('mode', filters.mode);

        const response = await api.get(`/connect/discover?${params.toString()}`);
        return response.data;
    },

    // Get filter options
    getFilterOptions: async () => {
        const response = await api.get('/connect/discover/filters');
        return response.data;
    },

    // Get match score with specific user
    getMatchScore: async (userId) => {
        const response = await api.get(`/connect/match-score/${userId}`);
        return response.data;
    },

    // ========== CONNECTION API ==========

    // Send connection request
    sendRequest: async (userId, message = '') => {
        const response = await api.post(`/connect/request/${userId}`, { message });
        return response.data;
    },

    // Get pending requests (received)
    getPendingRequests: async () => {
        const response = await api.get('/connect/requests/pending');
        return response.data;
    },

    // Get sent requests
    getSentRequests: async () => {
        const response = await api.get('/connect/requests/sent');
        return response.data;
    },

    // Accept request
    acceptRequest: async (requestId) => {
        const response = await api.put(`/connect/request/${requestId}/accept`);
        return response.data;
    },

    // Reject request
    rejectRequest: async (requestId) => {
        const response = await api.put(`/connect/request/${requestId}/reject`);
        return response.data;
    },

    // Get connected partners
    getPartners: async () => {
        const response = await api.get('/connect/partners');
        return response.data;
    },

    // Get partners' progress
    getPartnersProgress: async () => {
        const response = await api.get('/connect/partners/progress');
        return response.data;
    },

    // Remove partner
    removePartner: async (userId) => {
        const response = await api.delete(`/connect/partner/${userId}`);
        return response.data;
    },

    // Block user
    blockUser: async (userId, reason = '') => {
        const response = await api.post(`/connect/block/${userId}`, { reason });
        return response.data;
    },

    // ========== MESSAGING API ==========

    // Get messages for a connection
    getMessages: async (connectionId, page = 1, limit = 50) => {
        const response = await api.get(`/connect/messages/${connectionId}?page=${page}&limit=${limit}`);
        return response.data;
    },

    // Send message
    sendMessage: async (connectionId, content) => {
        const response = await api.post(`/connect/messages/${connectionId}`, { content });
        return response.data;
    },

    // Mark messages as read
    markAsRead: async (connectionId) => {
        const response = await api.put(`/connect/messages/${connectionId}/read`);
        return response.data;
    },

    // Get unread count
    getUnreadCount: async () => {
        const response = await api.get('/connect/messages/unread');
        return response.data;
    },
};

export default connectAPI;
