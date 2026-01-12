import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["PRODUCTIVE", "NEUTRAL", "NEEDS_IMPROVEMENT"],
        required: true,
    },
    note: {
        type: String,
        maxlength: 300,
        trim: true,
    },
    suggestRematch: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { _id: true });

const connectionHealthSchema = new mongoose.Schema(
    {
        connectionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Connection",
            required: true,
            unique: true,
        },

        // Overall health metrics (0-100)
        overallScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 50,
        },
        healthStatus: {
            type: String,
            enum: ["HEALTHY", "GOOD", "FAIR", "AT_RISK", "INACTIVE"],
            default: "GOOD",
        },

        // Individual metrics (0-100)
        metrics: {
            interactionFrequency: {
                score: { type: Number, min: 0, max: 100, default: 50 },
                lastCalculated: Date,
                trend: { type: String, enum: ["UP", "DOWN", "STABLE"], default: "STABLE" },
            },
            completionBalance: {
                score: { type: Number, min: 0, max: 100, default: 50 },
                studentACompletion: { type: Number, min: 0, max: 100, default: 0 },
                studentBCompletion: { type: Number, min: 0, max: 100, default: 0 },
                lastCalculated: Date,
            },
            engagementScore: {
                score: { type: Number, min: 0, max: 100, default: 50 },
                messagesThisWeek: { type: Number, default: 0 },
                checkInsCompleted: { type: Number, default: 0 },
                resourcesShared: { type: Number, default: 0 },
                lastCalculated: Date,
            },
            responseTime: {
                averageHours: { type: Number, default: 0 },
                score: { type: Number, min: 0, max: 100, default: 50 },
            },
            goalAlignment: {
                score: { type: Number, min: 0, max: 100, default: 50 },
                sharedGoalsProgress: { type: Number, default: 0 },
            },
        },

        // Activity tracking
        activity: {
            lastMessageAt: Date,
            lastCheckInAt: Date,
            lastPlanUpdateAt: Date,
            lastResourceSharedAt: Date,
            consecutiveInactiveDays: { type: Number, default: 0 },
            totalActiveDays: { type: Number, default: 0 },
        },

        // Streaks
        streaks: {
            currentStreak: { type: Number, default: 0 },
            longestStreak: { type: Number, default: 0 },
            weeklyGoalStreak: { type: Number, default: 0 },
        },

        // Feedback from both users
        feedback: [feedbackSchema],

        // Alerts & Warnings
        alerts: [{
            type: {
                type: String,
                enum: [
                    "LOW_ACTIVITY",
                    "UNBALANCED_PROGRESS",
                    "NO_CHECKINS",
                    "ONE_SIDED_MESSAGES",
                    "GOAL_STALLED",
                    "REMATCH_SUGGESTED",
                ],
            },
            message: String,
            severity: {
                type: String,
                enum: ["INFO", "WARNING", "CRITICAL"],
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
            acknowledged: {
                type: Boolean,
                default: false,
            },
        }],

        // Suggestions for improvement
        suggestions: [{
            type: {
                type: String,
                enum: [
                    "INCREASE_MESSAGES",
                    "SCHEDULE_CHECKIN",
                    "UPDATE_PLAN",
                    "SHARE_RESOURCE",
                    "COMPLETE_PENDING",
                    "SYNC_PROGRESS",
                ],
            },
            message: String,
            priority: {
                type: Number,
                min: 1,
                max: 5,
                default: 3,
            },
        }],

        // Last calculation timestamp
        lastCalculatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
connectionHealthSchema.index({ connectionId: 1 });
connectionHealthSchema.index({ healthStatus: 1 });
connectionHealthSchema.index({ overallScore: 1 });
connectionHealthSchema.index({ lastCalculatedAt: 1 });

// Calculate overall score based on metrics
connectionHealthSchema.methods.calculateOverallScore = function () {
    const weights = {
        interactionFrequency: 0.25,
        completionBalance: 0.25,
        engagementScore: 0.30,
        responseTime: 0.10,
        goalAlignment: 0.10,
    };

    let totalScore = 0;
    totalScore += (this.metrics.interactionFrequency.score || 0) * weights.interactionFrequency;
    totalScore += (this.metrics.completionBalance.score || 0) * weights.completionBalance;
    totalScore += (this.metrics.engagementScore.score || 0) * weights.engagementScore;
    totalScore += (this.metrics.responseTime.score || 0) * weights.responseTime;
    totalScore += (this.metrics.goalAlignment.score || 0) * weights.goalAlignment;

    this.overallScore = Math.round(totalScore);
    this.updateHealthStatus();

    return this.overallScore;
};

// Update health status based on score
connectionHealthSchema.methods.updateHealthStatus = function () {
    if (this.overallScore >= 80) {
        this.healthStatus = "HEALTHY";
    } else if (this.overallScore >= 60) {
        this.healthStatus = "GOOD";
    } else if (this.overallScore >= 40) {
        this.healthStatus = "FAIR";
    } else if (this.overallScore >= 20) {
        this.healthStatus = "AT_RISK";
    } else {
        this.healthStatus = "INACTIVE";
    }
};

// Add feedback
connectionHealthSchema.methods.addFeedback = async function (fromUser, status, note = "", suggestRematch = false) {
    // Remove old feedback from same user (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    this.feedback = this.feedback.filter(
        f => f.fromUser.toString() !== fromUser.toString() || f.createdAt < thirtyDaysAgo
    );

    this.feedback.push({
        fromUser,
        status,
        note,
        suggestRematch,
    });

    // Check if rematch suggested
    if (suggestRematch) {
        this.addAlert("REMATCH_SUGGESTED", "A partner has suggested finding a new match", "WARNING");
    }

    await this.save();
    return this;
};

// Add alert
connectionHealthSchema.methods.addAlert = function (type, message, severity = "INFO") {
    // Check if alert already exists (not acknowledged)
    const existingAlert = this.alerts.find(a => a.type === type && !a.acknowledged);
    if (existingAlert) return;

    this.alerts.push({ type, message, severity });
};

// Acknowledge alert
connectionHealthSchema.methods.acknowledgeAlert = async function (alertId) {
    const alert = this.alerts.id(alertId);
    if (alert) {
        alert.acknowledged = true;
        await this.save();
    }
};

// Generate suggestions based on metrics
connectionHealthSchema.methods.generateSuggestions = function () {
    this.suggestions = [];

    if (this.metrics.interactionFrequency.score < 40) {
        this.suggestions.push({
            type: "INCREASE_MESSAGES",
            message: "Try sending a message to your partner today",
            priority: 4,
        });
    }

    if (this.metrics.completionBalance.score < 50) {
        this.suggestions.push({
            type: "SYNC_PROGRESS",
            message: "Your progress seems unbalanced. Consider syncing your study pace.",
            priority: 3,
        });
    }

    if (this.metrics.engagementScore.checkInsCompleted < 2) {
        this.suggestions.push({
            type: "SCHEDULE_CHECKIN",
            message: "Complete your weekly check-in to stay accountable",
            priority: 4,
        });
    }

    if (this.activity.consecutiveInactiveDays > 3) {
        this.suggestions.push({
            type: "UPDATE_PLAN",
            message: "You haven't updated your study plan recently",
            priority: 3,
        });
    }
};

// Static: Get or create health for connection
connectionHealthSchema.statics.getOrCreate = async function (connectionId) {
    let health = await this.findOne({ connectionId });

    if (!health) {
        health = await this.create({ connectionId });
    }

    return health;
};

// Static: Calculate health for connection
connectionHealthSchema.statics.calculateHealth = async function (connectionId) {
    const Connection = mongoose.model("Connection");
    const Message = mongoose.model("Message");
    const StudyPlan = mongoose.model("StudyPlan");
    const WeeklyCheckIn = mongoose.model("WeeklyCheckIn");

    const health = await this.getOrCreate(connectionId);
    const connection = await Connection.findById(connectionId);

    if (!connection) throw new Error("Connection not found");

    const now = new Date();
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // Calculate interaction frequency
    const recentMessages = await Message.countDocuments({
        connectionId,
        createdAt: { $gte: oneWeekAgo },
    });

    const interactionScore = Math.min(100, recentMessages * 10);
    health.metrics.interactionFrequency.score = interactionScore;
    health.metrics.interactionFrequency.lastCalculated = now;

    // Calculate engagement score
    const weeklyMessages = recentMessages;
    const monthlyCheckIns = await WeeklyCheckIn.countDocuments({
        connectionId,
        status: "SUBMITTED",
        createdAt: { $gte: oneMonthAgo },
    });

    const engagementBase = (weeklyMessages * 5) + (monthlyCheckIns * 15);
    health.metrics.engagementScore.score = Math.min(100, engagementBase);
    health.metrics.engagementScore.messagesThisWeek = weeklyMessages;
    health.metrics.engagementScore.checkInsCompleted = monthlyCheckIns;
    health.metrics.engagementScore.lastCalculated = now;

    // Calculate completion balance (from study plan)
    const studyPlan = await StudyPlan.findOne({ connectionId, isActive: true });
    if (studyPlan && studyPlan.checklist.length > 0) {
        const total = studyPlan.checklist.length;
        const aCompleted = studyPlan.checklist.filter(i => i.studentAStatus === "COMPLETED").length;
        const bCompleted = studyPlan.checklist.filter(i => i.studentBStatus === "COMPLETED").length;

        const aPercent = (aCompleted / total) * 100;
        const bPercent = (bCompleted / total) * 100;
        const balance = 100 - Math.abs(aPercent - bPercent);

        health.metrics.completionBalance.score = Math.round(balance);
        health.metrics.completionBalance.studentACompletion = Math.round(aPercent);
        health.metrics.completionBalance.studentBCompletion = Math.round(bPercent);
        health.metrics.completionBalance.lastCalculated = now;
    }

    // Update activity
    const lastMessage = await Message.findOne({ connectionId }).sort({ createdAt: -1 });
    if (lastMessage) {
        health.activity.lastMessageAt = lastMessage.createdAt;
        const daysSinceMessage = Math.floor((now - lastMessage.createdAt) / (1000 * 60 * 60 * 24));
        health.activity.consecutiveInactiveDays = daysSinceMessage;
    }

    // Calculate overall and generate suggestions
    health.calculateOverallScore();
    health.generateSuggestions();

    // Add alerts if needed
    if (health.activity.consecutiveInactiveDays > 7) {
        health.addAlert("LOW_ACTIVITY", "No activity for over a week", "WARNING");
    }

    if (health.metrics.completionBalance.score < 30) {
        health.addAlert("UNBALANCED_PROGRESS", "Progress between partners is very unbalanced", "INFO");
    }

    health.lastCalculatedAt = now;
    await health.save();

    return health;
};

// Static: Get unhealthy connections (for admin/background jobs)
connectionHealthSchema.statics.getAtRiskConnections = async function () {
    return this.find({
        healthStatus: { $in: ["AT_RISK", "INACTIVE"] },
    })
        .populate("connectionId")
        .sort({ overallScore: 1 });
};

const ConnectionHealth = mongoose.model("ConnectionHealth", connectionHealthSchema);

export default ConnectionHealth;
