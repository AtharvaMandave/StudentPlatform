import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema(
    {
        // Can be user-level or connection-level
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        connectionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Connection",
        },
        partnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        // Milestone Type
        type: {
            type: String,
            enum: [
                // Streak milestones
                "STREAK_3",
                "STREAK_7",
                "STREAK_14",
                "STREAK_30",
                "STREAK_60",
                "STREAK_100",
                // Topic/Learning milestones
                "FIRST_TOPIC",
                "TOPICS_5",
                "TOPICS_10",
                "TOPICS_25",
                "TOPICS_50",
                // Partnership milestones
                "FIRST_CONNECTION",
                "FIRST_MESSAGE",
                "FIRST_CHECKIN",
                "WEEKLY_GOAL_MET",
                "TOPIC_TOGETHER",
                "PLAN_CREATED",
                "RESOURCE_SHARED",
                // Engagement milestones
                "MESSAGES_10",
                "MESSAGES_50",
                "MESSAGES_100",
                "CHECKINS_4",
                "CHECKINS_10",
                // Special achievements
                "EARLY_BIRD",        // Completed task before deadline
                "CONSISTENT_PAIR",   // Both partners completed weekly goals
                "STUDY_MARATHON",    // 4+ hours in a day
                "HELPER",            // Shared 5+ resources
            ],
            required: true,
        },

        // Badge info
        badge: {
            name: {
                type: String,
                required: true,
            },
            icon: {
                type: String,
                default: "🏆",
            },
            color: {
                type: String,
                default: "gold",
            },
            tier: {
                type: String,
                enum: ["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"],
                default: "BRONZE",
            },
        },

        // Points & Rewards
        points: {
            type: Number,
            default: 10,
            min: 0,
        },

        // Context
        description: {
            type: String,
            trim: true,
            maxlength: 200,
        },
        context: {
            // Any additional data about how milestone was earned
            type: mongoose.Schema.Types.Mixed,
        },

        // Visibility
        isPublic: {
            type: Boolean,
            default: true,
        },
        showOnProfile: {
            type: Boolean,
            default: true,
        },

        // Timestamps
        earnedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
milestoneSchema.index({ userId: 1, type: 1 });
milestoneSchema.index({ connectionId: 1 });
milestoneSchema.index({ earnedAt: -1 });
milestoneSchema.index({ type: 1 });

// Prevent duplicate milestones for same user/connection and type
milestoneSchema.index(
    { userId: 1, connectionId: 1, type: 1 },
    { unique: true, sparse: true }
);

// Badge configurations
const BADGE_CONFIG = {
    STREAK_3: { name: "Getting Started", icon: "🔥", tier: "BRONZE", points: 10 },
    STREAK_7: { name: "Week Warrior", icon: "🔥", tier: "SILVER", points: 25 },
    STREAK_14: { name: "Fortnight Fighter", icon: "🔥", tier: "GOLD", points: 50 },
    STREAK_30: { name: "Monthly Master", icon: "🔥", tier: "PLATINUM", points: 100 },
    STREAK_60: { name: "Dedicated Scholar", icon: "🔥", tier: "PLATINUM", points: 200 },
    STREAK_100: { name: "Legendary Learner", icon: "💎", tier: "DIAMOND", points: 500 },

    FIRST_TOPIC: { name: "First Step", icon: "📚", tier: "BRONZE", points: 5 },
    TOPICS_5: { name: "Getting Momentum", icon: "📚", tier: "BRONZE", points: 15 },
    TOPICS_10: { name: "Knowledge Seeker", icon: "📚", tier: "SILVER", points: 30 },
    TOPICS_25: { name: "Topic Tackler", icon: "📚", tier: "GOLD", points: 75 },
    TOPICS_50: { name: "Subject Master", icon: "📚", tier: "PLATINUM", points: 150 },

    FIRST_CONNECTION: { name: "Social Learner", icon: "🤝", tier: "BRONZE", points: 10 },
    FIRST_MESSAGE: { name: "Ice Breaker", icon: "💬", tier: "BRONZE", points: 5 },
    FIRST_CHECKIN: { name: "Accountable", icon: "✅", tier: "BRONZE", points: 10 },
    WEEKLY_GOAL_MET: { name: "Goal Getter", icon: "🎯", tier: "SILVER", points: 25 },
    TOPIC_TOGETHER: { name: "Team Player", icon: "👥", tier: "SILVER", points: 30 },
    PLAN_CREATED: { name: "Planner", icon: "📋", tier: "BRONZE", points: 15 },
    RESOURCE_SHARED: { name: "Generous", icon: "🎁", tier: "BRONZE", points: 10 },

    MESSAGES_10: { name: "Communicator", icon: "💬", tier: "BRONZE", points: 10 },
    MESSAGES_50: { name: "Conversationalist", icon: "💬", tier: "SILVER", points: 25 },
    MESSAGES_100: { name: "Connection Pro", icon: "💬", tier: "GOLD", points: 50 },
    CHECKINS_4: { name: "Monthly Reviewer", icon: "📝", tier: "SILVER", points: 30 },
    CHECKINS_10: { name: "Reflection Master", icon: "📝", tier: "GOLD", points: 75 },

    EARLY_BIRD: { name: "Early Bird", icon: "🌅", tier: "SILVER", points: 20 },
    CONSISTENT_PAIR: { name: "Perfect Pair", icon: "⭐", tier: "GOLD", points: 50 },
    STUDY_MARATHON: { name: "Marathon Runner", icon: "🏃", tier: "SILVER", points: 25 },
    HELPER: { name: "Helpful Hero", icon: "🦸", tier: "GOLD", points: 50 },
};

// Pre-save: Auto-populate badge info
milestoneSchema.pre("save", async function () {
    if (this.isNew && BADGE_CONFIG[this.type]) {
        const config = BADGE_CONFIG[this.type];
        const tierColors = {
            BRONZE: "#CD7F32",
            SILVER: "#C0C0C0",
            GOLD: "#FFD700",
            PLATINUM: "#E5E4E2",
            DIAMOND: "#B9F2FF",
        };
        this.badge = {
            name: config.name,
            icon: config.icon,
            tier: config.tier,
            color: tierColors[config.tier] || tierColors.BRONZE,
        };
        this.points = config.points;
    }
});

// Method: Get tier color
milestoneSchema.methods.getTierColor = function (tier) {
    const colors = {
        BRONZE: "#CD7F32",
        SILVER: "#C0C0C0",
        GOLD: "#FFD700",
        PLATINUM: "#E5E4E2",
        DIAMOND: "#B9F2FF",
    };
    return colors[tier] || colors.BRONZE;
};

// Static: Award milestone to user
milestoneSchema.statics.awardMilestone = async function (userId, type, connectionId = null, context = {}) {
    // Check if already has this milestone
    const existing = await this.findOne({
        userId,
        type,
        ...(connectionId && { connectionId }),
    });

    if (existing) return null; // Already has this milestone

    const config = BADGE_CONFIG[type];
    if (!config) throw new Error(`Unknown milestone type: ${type}`);

    const milestone = await this.create({
        userId,
        type,
        connectionId,
        context,
        badge: {
            name: config.name,
            icon: config.icon,
            tier: config.tier,
        },
        points: config.points,
        description: `Earned ${config.name} badge`,
    });

    return milestone;
};

// Static: Get user's milestones
milestoneSchema.statics.getUserMilestones = async function (userId, options = {}) {
    const { limit = 50, includePrivate = false } = options;

    const query = { userId };
    if (!includePrivate) query.isPublic = true;

    return this.find(query)
        .sort({ earnedAt: -1 })
        .limit(limit);
};

// Static: Get connection's shared milestones
milestoneSchema.statics.getConnectionMilestones = async function (connectionId) {
    return this.find({ connectionId })
        .populate("userId", "name")
        .sort({ earnedAt: -1 });
};

// Static: Get total points for user
milestoneSchema.statics.getTotalPoints = async function (userId) {
    const result = await this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: "$points" } } },
    ]);
    return result.length > 0 ? result[0].total : 0;
};

// Static: Check and award streak milestones
milestoneSchema.statics.checkStreakMilestones = async function (userId, currentStreak) {
    const streakMilestones = [
        { streak: 3, type: "STREAK_3" },
        { streak: 7, type: "STREAK_7" },
        { streak: 14, type: "STREAK_14" },
        { streak: 30, type: "STREAK_30" },
        { streak: 60, type: "STREAK_60" },
        { streak: 100, type: "STREAK_100" },
    ];

    const awarded = [];
    for (const { streak, type } of streakMilestones) {
        if (currentStreak >= streak) {
            const milestone = await this.awardMilestone(userId, type, null, { streak: currentStreak });
            if (milestone) awarded.push(milestone);
        }
    }
    return awarded;
};

// Static: Check and award topic milestones
milestoneSchema.statics.checkTopicMilestones = async function (userId, topicsCompleted) {
    const topicMilestones = [
        { count: 1, type: "FIRST_TOPIC" },
        { count: 5, type: "TOPICS_5" },
        { count: 10, type: "TOPICS_10" },
        { count: 25, type: "TOPICS_25" },
        { count: 50, type: "TOPICS_50" },
    ];

    const awarded = [];
    for (const { count, type } of topicMilestones) {
        if (topicsCompleted >= count) {
            const milestone = await this.awardMilestone(userId, type, null, { topicsCompleted });
            if (milestone) awarded.push(milestone);
        }
    }
    return awarded;
};

const Milestone = mongoose.model("Milestone", milestoneSchema);

export default Milestone;
