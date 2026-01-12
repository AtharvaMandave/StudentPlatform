import Milestone from "../models/milestone.model.js";

/**
 * Get user's milestones
 * @route GET /api/connect/milestones
 */
export const getUserMilestones = async (req, res) => {
    try {
        const { limit = 50 } = req.query;

        const milestones = await Milestone.getUserMilestones(req.user._id, {
            limit: parseInt(limit),
        });

        const totalPoints = await Milestone.getTotalPoints(req.user._id);

        // Group by tier
        const byTier = milestones.reduce((acc, m) => {
            const tier = m.badge.tier;
            if (!acc[tier]) acc[tier] = [];
            acc[tier].push(m);
            return acc;
        }, {});

        res.json({
            success: true,
            data: {
                milestones,
                totalPoints,
                count: milestones.length,
                byTier,
            },
        });
    } catch (error) {
        console.error("Get user milestones error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch milestones",
        });
    }
};

/**
 * Get connection milestones
 * @route GET /api/connect/milestones/:connectionId
 */
export const getConnectionMilestones = async (req, res) => {
    try {
        const { connectionId } = req.params;

        const milestones = await Milestone.getConnectionMilestones(connectionId);

        res.json({
            success: true,
            data: milestones,
        });
    } catch (error) {
        console.error("Get connection milestones error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch connection milestones",
        });
    }
};

/**
 * Get milestone leaderboard
 * @route GET /api/connect/milestones/leaderboard
 */
export const getLeaderboard = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // Aggregate top users by points
        const leaderboard = await Milestone.aggregate([
            { $group: { _id: "$userId", totalPoints: { $sum: "$points" }, count: { $sum: 1 } } },
            { $sort: { totalPoints: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },
            {
                $project: {
                    userId: "$_id",
                    name: "$user.name",
                    totalPoints: 1,
                    badgeCount: "$count",
                },
            },
        ]);

        // Find current user's rank
        const userPoints = await Milestone.getTotalPoints(req.user._id);
        const userRank = leaderboard.findIndex(
            (u) => u.userId.toString() === req.user._id.toString()
        ) + 1;

        res.json({
            success: true,
            data: {
                leaderboard,
                currentUser: {
                    rank: userRank || "Unranked",
                    points: userPoints,
                },
            },
        });
    } catch (error) {
        console.error("Get leaderboard error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch leaderboard",
        });
    }
};

/**
 * Toggle milestone visibility on profile
 * @route PUT /api/connect/milestones/:milestoneId/visibility
 */
export const toggleVisibility = async (req, res) => {
    try {
        const { milestoneId } = req.params;
        const { showOnProfile } = req.body;

        const milestone = await Milestone.findOne({
            _id: milestoneId,
            userId: req.user._id,
        });

        if (!milestone) {
            return res.status(404).json({
                success: false,
                message: "Milestone not found",
            });
        }

        milestone.showOnProfile = showOnProfile;
        await milestone.save();

        res.json({
            success: true,
            message: `Milestone ${showOnProfile ? "will be shown" : "hidden"} on profile`,
            data: milestone,
        });
    } catch (error) {
        console.error("Toggle visibility error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update milestone visibility",
        });
    }
};

export default {
    getUserMilestones,
    getConnectionMilestones,
    getLeaderboard,
    toggleVisibility,
};
