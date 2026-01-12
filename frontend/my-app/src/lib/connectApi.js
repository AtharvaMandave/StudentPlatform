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

    // ========== STUDY PLAN API ==========

    // Get study plan for a connection
    getStudyPlan: async (connectionId) => {
        const response = await api.get(`/connect/plan/${connectionId}`);
        return response.data;
    },

    // Create study plan
    createStudyPlan: async (connectionId, planData) => {
        const response = await api.post(`/connect/plan/${connectionId}`, planData);
        return response.data;
    },

    // Update study plan
    updateStudyPlan: async (connectionId, updates) => {
        const response = await api.put(`/connect/plan/${connectionId}`, updates);
        return response.data;
    },

    // Add checklist item
    addChecklistItem: async (connectionId, item) => {
        const response = await api.post(`/connect/plan/${connectionId}/checklist`, item);
        return response.data;
    },

    // Update checklist item
    updateChecklistItem: async (connectionId, itemId, updates) => {
        const response = await api.put(`/connect/plan/${connectionId}/checklist/${itemId}`, updates);
        return response.data;
    },

    // Remove checklist item
    removeChecklistItem: async (connectionId, itemId) => {
        const response = await api.delete(`/connect/plan/${connectionId}/checklist/${itemId}`);
        return response.data;
    },

    // Update weekly schedule
    updateSchedule: async (connectionId, weeklySchedule) => {
        const response = await api.put(`/connect/plan/${connectionId}/schedule`, { weeklySchedule });
        return response.data;
    },

    // ========== CHECK-IN API ==========

    // Get check-ins for a connection
    getCheckIns: async (connectionId, limit = 12) => {
        const response = await api.get(`/connect/checkin/${connectionId}?limit=${limit}`);
        return response.data;
    },

    // Get current week's check-in
    getCurrentCheckIn: async (connectionId) => {
        const response = await api.get(`/connect/checkin/${connectionId}/current`);
        return response.data;
    },

    // Update/submit check-in
    updateCheckIn: async (connectionId, data, submit = false) => {
        const response = await api.put(`/connect/checkin/${connectionId}`, { ...data, submit });
        return response.data;
    },

    // Get check-in prompts
    getCheckInPrompts: async () => {
        const response = await api.get('/connect/checkin/prompts');
        return response.data;
    },

    // Get check-in stats
    getCheckInStats: async () => {
        const response = await api.get('/connect/checkin/stats');
        return response.data;
    },

    // Get partner progress comparison
    getPartnerComparison: async (connectionId) => {
        const response = await api.get(`/connect/progress/${connectionId}`);
        return response.data;
    },

    // ========== MILESTONE API ==========

    // Get user milestones
    getMilestones: async (limit = 50) => {
        const response = await api.get(`/connect/milestones?limit=${limit}`);
        return response.data;
    },

    // Get connection milestones
    getConnectionMilestones: async (connectionId) => {
        const response = await api.get(`/connect/milestones/${connectionId}`);
        return response.data;
    },

    // Get leaderboard
    getLeaderboard: async (limit = 10) => {
        const response = await api.get(`/connect/milestones/leaderboard?limit=${limit}`);
        return response.data;
    },

    // Toggle milestone visibility
    toggleMilestoneVisibility: async (milestoneId, showOnProfile) => {
        const response = await api.put(`/connect/milestones/${milestoneId}/visibility`, { showOnProfile });
        return response.data;
    },

    // ========== RESOURCE API ==========

    // Get resources for a connection
    getResources: async (connectionId, filters = {}) => {
        const params = new URLSearchParams();
        if (filters.type) params.append('type', filters.type);
        if (filters.topic) params.append('topic', filters.topic);
        if (filters.tags) params.append('tags', filters.tags.join(','));

        const response = await api.get(`/connect/resources/${connectionId}?${params.toString()}`);
        return response.data;
    },

    // Create a new resource
    createResource: async (connectionId, resourceData) => {
        const response = await api.post(`/connect/resources/${connectionId}`, resourceData);
        return response.data;
    },

    // Update a resource
    updateResource: async (connectionId, resourceId, updates) => {
        const response = await api.put(`/connect/resources/${connectionId}/${resourceId}`, updates);
        return response.data;
    },

    // Delete a resource
    deleteResource: async (connectionId, resourceId) => {
        const response = await api.delete(`/connect/resources/${connectionId}/${resourceId}`);
        return response.data;
    },

    // Toggle bookmark
    toggleResourceBookmark: async (connectionId, resourceId) => {
        const response = await api.post(`/connect/resources/${connectionId}/${resourceId}/bookmark`);
        return response.data;
    },

    // Get bookmarked resources
    getBookmarkedResources: async (connectionId) => {
        const response = await api.get(`/connect/resources/${connectionId}/bookmarked`);
        return response.data;
    },

    // Search resources
    searchResources: async (connectionId, query) => {
        const response = await api.get(`/connect/resources/${connectionId}/search?q=${encodeURIComponent(query)}`);
        return response.data;
    },

    // Increment view count
    incrementResourceView: async (connectionId, resourceId) => {
        const response = await api.post(`/connect/resources/${connectionId}/${resourceId}/view`);
        return response.data;
    },
};

export default connectAPI;
