import WeeklyCheckIn from "../models/weeklyCheckIn.model.js";
import Connection from "../models/connection.model.js";
import Milestone from "../models/milestone.model.js";

/**
 * Get check-ins for a connection
 * @route GET /api/connect/checkin/:connectionId
 */
export const getCheckIns = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const { limit = 12 } = req.query;

        // Verify user is part of this connection
        const connection = await Connection.findOne({
            _id: connectionId,
            status: "ACCEPTED",
            $or: [{ requesterId: req.user._id }, { receiverId: req.user._id }],
        });

        if (!connection) {
            return res.status(403).json({
                success: false,
                message: "You are not part of this connection",
            });
        }

        // Get all check-ins for this connection
        const checkIns = await WeeklyCheckIn.getConnectionCheckIns(connectionId, {
            limit: parseInt(limit),
        });

        // Get current week's check-in for current user
        const currentCheckIn = await WeeklyCheckIn.getOrCreateForWeek(connectionId, req.user._id);

        // Get partner's check-in for current week
        const partnerCheckIn = await WeeklyCheckIn.getPartnerCheckIn(
            connectionId,
            req.user._id,
            currentCheckIn.weekOf
        );

        res.json({
            success: true,
            data: {
                checkIns,
                currentCheckIn,
                partnerCheckIn,
            },
        });
    } catch (error) {
        console.error("Get check-ins error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch check-ins",
        });
    }
};

/**
 * Get or create current week's check-in
 * @route GET /api/connect/checkin/:connectionId/current
 */
export const getCurrentCheckIn = async (req, res) => {
    try {
        const { connectionId } = req.params;

        // Verify user is part of this connection
        const connection = await Connection.findOne({
            _id: connectionId,
            status: "ACCEPTED",
            $or: [{ requesterId: req.user._id }, { receiverId: req.user._id }],
        });

        if (!connection) {
            return res.status(403).json({
                success: false,
                message: "You are not part of this connection",
            });
        }

        const checkIn = await WeeklyCheckIn.getOrCreateForWeek(connectionId, req.user._id);
        const prompts = WeeklyCheckIn.getPrompts();

        res.json({
            success: true,
            data: {
                checkIn,
                prompts,
            },
        });
    } catch (error) {
        console.error("Get current check-in error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch current check-in",
        });
    }
};

/**
 * Update check-in (save draft or submit)
 * @route PUT /api/connect/checkin/:connectionId
 */
export const updateCheckIn = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const {
            completedTopics,
            totalHoursStudied,
            tasksCompleted,
            goalsMet,
            reflection,
            nextWeekPlan,
            weeklyMood,
            energyLevel,
            partnerInteraction,
            visibility,
            submit,
        } = req.body;

        // Verify user is part of this connection
        const connection = await Connection.findOne({
            _id: connectionId,
            status: "ACCEPTED",
            $or: [{ requesterId: req.user._id }, { receiverId: req.user._id }],
        });

        if (!connection) {
            return res.status(403).json({
                success: false,
                message: "You are not part of this connection",
            });
        }

        // Get or create check-in for current week
        const checkIn = await WeeklyCheckIn.getOrCreateForWeek(connectionId, req.user._id);

        // Don't allow editing submitted check-ins
        if (checkIn.status === "SUBMITTED" && !submit) {
            return res.status(400).json({
                success: false,
                message: "Cannot edit a submitted check-in",
            });
        }

        // Update fields
        if (completedTopics !== undefined) checkIn.completedTopics = completedTopics;
        if (totalHoursStudied !== undefined) checkIn.totalHoursStudied = totalHoursStudied;
        if (tasksCompleted !== undefined) checkIn.tasksCompleted = tasksCompleted;
        if (goalsMet !== undefined) checkIn.goalsMet = goalsMet;
        if (reflection !== undefined) checkIn.reflection = reflection;
        if (nextWeekPlan !== undefined) checkIn.nextWeekPlan = nextWeekPlan;
        if (weeklyMood !== undefined) checkIn.weeklyMood = weeklyMood;
        if (energyLevel !== undefined) checkIn.energyLevel = energyLevel;
        if (partnerInteraction !== undefined) checkIn.partnerInteraction = partnerInteraction;
        if (visibility !== undefined) checkIn.visibility = visibility;

        // Submit if requested
        if (submit) {
            await checkIn.submit();

            // Check for milestone: First check-in
            const totalCheckIns = await WeeklyCheckIn.countDocuments({
                userId: req.user._id,
                status: "SUBMITTED",
            });

            if (totalCheckIns === 1) {
                await Milestone.awardMilestone(req.user._id, "FIRST_CHECKIN", connectionId);
            }
            if (totalCheckIns >= 4) {
                await Milestone.awardMilestone(req.user._id, "CHECKINS_4", connectionId);
            }
            if (totalCheckIns >= 10) {
                await Milestone.awardMilestone(req.user._id, "CHECKINS_10", connectionId);
            }
        } else {
            await checkIn.save();
        }

        res.json({
            success: true,
            message: submit ? "Check-in submitted successfully!" : "Check-in saved as draft",
            data: checkIn,
        });
    } catch (error) {
        console.error("Update check-in error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update check-in",
        });
    }
};

/**
 * Get check-in prompts
 * @route GET /api/connect/checkin/prompts
 */
export const getPrompts = async (req, res) => {
    try {
        const prompts = WeeklyCheckIn.getPrompts();
        res.json({
            success: true,
            data: prompts,
        });
    } catch (error) {
        console.error("Get prompts error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch prompts",
        });
    }
};

/**
 * Get user's check-in stats
 * @route GET /api/connect/checkin/stats
 */
export const getCheckInStats = async (req, res) => {
    try {
        const stats = await WeeklyCheckIn.getStats(req.user._id);
        const history = await WeeklyCheckIn.getUserCheckIns(req.user._id, { limit: 12 });
        res.json({
            success: true,
            data: { ...stats, history },
        });
    } catch (error) {
        console.error("Get check-in stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch check-in stats",
        });
    }
};

/**
 * Get progress comparison between partners
 * @route GET /api/connect/progress/:connectionId
 */
export const getPartnerComparison = async (req, res) => {
    try {
        const { connectionId } = req.params;

        // Verify user is part of this connection
        const connection = await Connection.findOne({
            _id: connectionId,
            status: "ACCEPTED",
            $or: [{ requesterId: req.user._id }, { receiverId: req.user._id }],
        }).populate('requesterId receiverId', 'name email');

        if (!connection) {
            return res.status(403).json({
                success: false,
                message: "You are not part of this connection",
            });
        }

        // Determine partner
        const partnerId = connection.requesterId._id.toString() === req.user._id.toString()
            ? connection.receiverId._id
            : connection.requesterId._id;

        const partnerInfo = connection.requesterId._id.toString() === req.user._id.toString()
            ? connection.receiverId
            : connection.requesterId;

        // Fetch stats for both users
        const [myStats, partnerStats] = await Promise.all([
            WeeklyCheckIn.getStats(req.user._id),
            WeeklyCheckIn.getStats(partnerId)
        ]);

        // Fetch history for both users
        const [myHistory, partnerHistory] = await Promise.all([
            WeeklyCheckIn.getUserCheckIns(req.user._id, { limit: 12 }),
            WeeklyCheckIn.getUserCheckIns(partnerId, { limit: 12 })
        ]);

        res.json({
            success: true,
            data: {
                myStats: { ...myStats, history: myHistory },
                partnerStats: { ...partnerStats, history: partnerHistory },
                partnerInfo: {
                    id: partnerId,
                    name: partnerInfo.name,
                    email: partnerInfo.email
                }
            },
        });
    } catch (error) {
        console.error("Get partner comparison error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch partner comparison",
        });
    }
};


export default {
    getCheckIns,
    getCurrentCheckIn,
    updateCheckIn,
    getPrompts,
    getCheckInStats,
    getPartnerComparison,
};
