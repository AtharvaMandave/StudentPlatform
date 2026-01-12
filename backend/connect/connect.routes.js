import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
    connectionRequestLimiter,
    messageLimiter,
    profileViewLimiter,
    discoveryLimiter,
} from "../middlewares/connectLimit.middleware.js";

// Controllers
import {
    getProfile,
    upsertProfile,
    getPublicProfile,
    updateProgress,
    updateSettings,
} from "./profile.controller.js";

import {
    discoverPartners,
    getFilterOptions,
    getMatchScore,
} from "./discovery.controller.js";

import {
    sendRequest,
    getPendingRequests,
    getSentRequests,
    acceptRequest,
    rejectRequest,
    getPartners,
    removePartner,
    blockUser,
    completeOnboarding,
    unmatchPartner,
    getSuggestedRematches,
} from "./connection.controller.js";

import {
    getMessages,
    sendMessage,
    markAsRead,
    getUnreadCount,
} from "./message.controller.js";

import {
    getStudyPlan,
    createStudyPlan,
    updateStudyPlan,
    addChecklistItem,
    updateChecklistItem,
    removeChecklistItem,
    updateSchedule,
} from "./studyPlan.controller.js";

import {
    getCheckIns,
    getCurrentCheckIn,
    updateCheckIn,
    getPrompts,
    getCheckInStats,
    getPartnerComparison,
} from "./checkIn.controller.js";

import {
    getUserMilestones,
    getConnectionMilestones,
    getLeaderboard,
    toggleVisibility,
} from "./milestone.controller.js";

import {
    getResources,
    createResource,
    updateResource,
    deleteResource,
    toggleBookmark,
    getBookmarkedResources,
    searchResources,
    incrementView,
} from "./resource.controller.js";


const router = express.Router();

// All routes require authentication
router.use(protect);

// ========== PROFILE ROUTES ==========
router.get("/profile", getProfile);
router.post("/profile", upsertProfile);
router.put("/profile", upsertProfile);
router.get("/profile/:userId", profileViewLimiter, getPublicProfile);
router.put("/progress", updateProgress);
router.put("/settings", updateSettings);

// ========== DISCOVERY ROUTES ==========
router.get("/discover", discoveryLimiter, discoverPartners);
router.get("/discover/filters", getFilterOptions);
router.get("/match-score/:userId", getMatchScore);

// ========== CONNECTION ROUTES ==========
router.post("/request/:userId", connectionRequestLimiter, sendRequest);
router.get("/requests/pending", getPendingRequests);
router.get("/requests/sent", getSentRequests);
router.put("/request/:requestId/accept", acceptRequest);
router.put("/request/:requestId/reject", rejectRequest);
router.get("/partners", getPartners);
router.get("/partners/progress", async (req, res) => {
    // Get partners with their progress stats
    try {
        const Connection = (await import("../models/connection.model.js")).default;
        const StudentProfile = (await import("../models/studentProfile.model.js")).default;

        const connections = await Connection.getPartners(req.user._id);

        const partnersProgress = await Promise.all(
            connections.map(async (conn) => {
                const partnerId =
                    conn.requesterId._id.toString() === req.user._id.toString()
                        ? conn.receiverId._id
                        : conn.requesterId._id;

                const partnerUser =
                    conn.requesterId._id.toString() === req.user._id.toString()
                        ? conn.receiverId
                        : conn.requesterId;

                const profile = await StudentProfile.findOne({ userId: partnerId });

                if (!profile || !profile.settings.showProgress) {
                    return {
                        partnerId,
                        name: partnerUser.name,
                        progressHidden: true,
                    };
                }

                return {
                    partnerId,
                    name: partnerUser.name,
                    currentFocus: profile.currentFocus,
                    progressStats: profile.progressStats,
                };
            })
        );

        res.json({
            success: true,
            data: partnersProgress,
        });
    } catch (error) {
        console.error("Get partners progress error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch partners progress",
        });
    }
});
router.delete("/partner/:userId", removePartner);
router.post("/block/:userId", blockUser);

// ========== ONBOARDING & UNMATCH ROUTES ==========
router.post("/onboarding/:connectionId", completeOnboarding);
router.post("/unmatch/:connectionId", unmatchPartner);
router.get("/rematches", getSuggestedRematches);

// ========== STUDY PLAN ROUTES ==========
router.get("/plan/:connectionId", getStudyPlan);
router.post("/plan/:connectionId", createStudyPlan);
router.put("/plan/:connectionId", updateStudyPlan);
router.post("/plan/:connectionId/checklist", addChecklistItem);
router.put("/plan/:connectionId/checklist/:itemId", updateChecklistItem);
router.delete("/plan/:connectionId/checklist/:itemId", removeChecklistItem);
router.put("/plan/:connectionId/schedule", updateSchedule);

// ========== CHECK-IN ROUTES ==========
router.get("/checkin/prompts", getPrompts);
router.get("/checkin/stats", getCheckInStats);
router.get("/progress/:connectionId", getPartnerComparison); // Partner comparison
router.get("/checkin/:connectionId", getCheckIns);
router.get("/checkin/:connectionId/current", getCurrentCheckIn);
router.put("/checkin/:connectionId", updateCheckIn);

// ========== MILESTONE ROUTES ==========
router.get("/milestones", getUserMilestones);
router.get("/milestones/leaderboard", getLeaderboard);
router.get("/milestones/:connectionId", getConnectionMilestones);
router.put("/milestones/:milestoneId/visibility", toggleVisibility);

// ========== MESSAGING ROUTES ==========
router.get("/messages/unread", getUnreadCount);
router.get("/messages/:connectionId", getMessages);
router.post("/messages/:connectionId", messageLimiter, sendMessage);
router.put("/messages/:connectionId/read", markAsRead);

// ========== RESOURCE ROUTES ==========
router.get("/resources/:connectionId", getResources);
router.get("/resources/:connectionId/bookmarked", getBookmarkedResources);
router.get("/resources/:connectionId/search", searchResources);
router.post("/resources/:connectionId", createResource);
router.put("/resources/:connectionId/:resourceId", updateResource);
router.delete("/resources/:connectionId/:resourceId", deleteResource);
router.post("/resources/:connectionId/:resourceId/bookmark", toggleBookmark);
router.post("/resources/:connectionId/:resourceId/view", incrementView);

export default router;
