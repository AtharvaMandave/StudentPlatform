import { findMatches, getMatchScoreBetween } from "../services/matching.service.js";
import StudentProfile from "../models/studentProfile.model.js";

/**
 * Discover potential study partners
 */
export const discoverPartners = async (req, res) => {
    try {
        const { page = 1, limit = 20, level, availability, mode } = req.query;

        const filters = {};
        if (level) filters.level = level;
        if (availability) filters.availability = availability;
        if (mode) filters.mode = mode;

        const result = await findMatches(
            req.user._id,
            filters,
            { page: parseInt(page), limit: parseInt(limit) }
        );

        // Format response
        const partners = result.matches.map((match) => ({
            userId: match.profile.userId._id,
            name: match.profile.userId.name,
            primaryGoal: match.profile.primaryGoal,
            studyLevel: match.profile.studyLevel,
            availability: match.profile.availability,
            preferredMode: match.profile.preferredMode,
            bio: match.profile.bio,
            currentFocus: match.profile.currentFocus,
            progressStats: match.profile.settings?.showProgress
                ? match.profile.progressStats
                : null,
            matchScore: match.matchScore,
            matchReasons: match.matchReasons,
        }));

        res.json({
            success: true,
            data: {
                partners,
                pagination: result.pagination,
            },
        });
    } catch (error) {
        console.error("Discover partners error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to discover partners",
        });
    }
};

/**
 * Get available filter options
 */
export const getFilterOptions = async (req, res) => {
    try {
        const userProfile = await StudentProfile.findOne({ userId: req.user._id });

        if (!userProfile) {
            return res.status(400).json({
                success: false,
                message: "Please complete your profile first",
            });
        }

        // Return filter options based on user's goal
        const options = {
            goals: [
                { value: userProfile.primaryGoal, label: formatGoal(userProfile.primaryGoal) },
            ],
            levels: [
                { value: "ALL", label: "All Levels" },
                { value: "BEGINNER", label: "Beginner" },
                { value: "INTERMEDIATE", label: "Intermediate" },
                { value: "ADVANCED", label: "Advanced" },
            ],
            availability: [
                { value: "ALL", label: "Any Availability" },
                { value: "DAILY", label: "Daily" },
                { value: "WEEKENDS", label: "Weekends" },
                { value: "FLEXIBLE", label: "Flexible" },
            ],
            modes: [
                { value: "ALL", label: "Any Mode" },
                { value: "ONLINE", label: "Online" },
                { value: "DISCUSSION", label: "Discussion-based" },
                { value: "BOTH", label: "Both" },
            ],
        };

        res.json({
            success: true,
            data: options,
        });
    } catch (error) {
        console.error("Get filter options error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get filter options",
        });
    }
};

/**
 * Get match score with a specific user
 */
export const getMatchScore = async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await getMatchScoreBetween(req.user._id, userId);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Get match score error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to calculate match score",
        });
    }
};

// Helper function
function formatGoal(goal) {
    const goals = {
        DSA: "DSA Preparation",
        WEB_DEV: "Web Development",
        HIGHER_STUDIES: "Higher Studies",
        UPSC: "UPSC Preparation",
        GATE: "GATE Exam",
        PLACEMENTS: "Campus Placements",
        OTHER: "Other",
    };
    return goals[goal] || goal;
}

export default {
    discoverPartners,
    getFilterOptions,
    getMatchScore,
};
