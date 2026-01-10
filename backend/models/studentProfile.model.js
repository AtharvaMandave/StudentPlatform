import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        // Goal & Preferences
        primaryGoal: {
            type: String,
            enum: ["DSA", "WEB_DEV", "HIGHER_STUDIES", "UPSC", "GATE", "PLACEMENTS", "OTHER"],
            required: true,
        },
        secondaryInterests: [{
            type: String,
            trim: true,
        }],
        studyLevel: {
            type: String,
            enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
            required: true,
        },
        availability: {
            type: {
                type: String,
                enum: ["DAILY", "WEEKENDS", "FLEXIBLE"],
                default: "FLEXIBLE",
            },
            hoursPerDay: {
                type: Number,
                min: 1,
                max: 12,
                default: 2,
            },
        },
        preferredMode: {
            type: String,
            enum: ["ONLINE", "DISCUSSION", "BOTH"],
            default: "BOTH",
        },

        // Bio & Display
        bio: {
            type: String,
            maxlength: 300,
            trim: true,
        },
        currentFocus: {
            type: String,
            maxlength: 100,
            trim: true,
        },

        // Progress Stats
        progressStats: {
            topicsCompleted: { type: Number, default: 0 },
            currentStreak: { type: Number, default: 0 },
            longestStreak: { type: Number, default: 0 },
            lastActiveAt: { type: Date, default: Date.now },
            completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
            totalStudyHours: { type: Number, default: 0 },
        },

        // Privacy & Settings
        settings: {
            showProgress: { type: Boolean, default: true },
            allowRequests: {
                type: String,
                enum: ["EVERYONE", "SIMILAR_GOAL", "NONE"],
                default: "EVERYONE",
            },
            maxPartners: { type: Number, default: 3, min: 1, max: 5 },
        },

        // Status
        isProfileComplete: { type: Boolean, default: false },
        activePartnersCount: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient querying
studentProfileSchema.index({ primaryGoal: 1, studyLevel: 1 });
studentProfileSchema.index({ userId: 1 });
studentProfileSchema.index({ "availability.type": 1 });

// Virtual to check if user can accept more partners
studentProfileSchema.virtual("canAcceptPartners").get(function () {
    return this.activePartnersCount < this.settings.maxPartners;
});

// Method to update progress
studentProfileSchema.methods.updateProgress = async function (updates) {
    if (updates.topicsCompleted !== undefined) {
        this.progressStats.topicsCompleted = updates.topicsCompleted;
    }
    if (updates.completionPercentage !== undefined) {
        this.progressStats.completionPercentage = Math.min(100, Math.max(0, updates.completionPercentage));
    }
    if (updates.studyHours !== undefined) {
        this.progressStats.totalStudyHours += updates.studyHours;
    }

    // Update streak logic
    const now = new Date();
    const lastActive = this.progressStats.lastActiveAt;
    const hoursDiff = (now - lastActive) / (1000 * 60 * 60);

    if (hoursDiff < 48) {
        // Still within streak window
        if (hoursDiff >= 20) {
            // New day, increment streak
            this.progressStats.currentStreak += 1;
            if (this.progressStats.currentStreak > this.progressStats.longestStreak) {
                this.progressStats.longestStreak = this.progressStats.currentStreak;
            }
        }
    } else {
        // Streak broken
        this.progressStats.currentStreak = 1;
    }

    this.progressStats.lastActiveAt = now;
    await this.save();
};

// Static method to find potential matches
studentProfileSchema.statics.findPotentialMatches = async function (userId, filters = {}) {
    const userProfile = await this.findOne({ userId });
    if (!userProfile) return [];

    const query = {
        userId: { $ne: userId },
        isProfileComplete: true,
        primaryGoal: userProfile.primaryGoal, // Must match goal
        "settings.allowRequests": { $ne: "NONE" },
    };

    // Apply additional filters
    if (filters.level) {
        query.studyLevel = filters.level;
    }
    if (filters.availability) {
        query["availability.type"] = filters.availability;
    }
    if (filters.mode) {
        query.preferredMode = { $in: [filters.mode, "BOTH"] };
    }

    const matches = await this.find(query)
        .populate("userId", "name email")
        .limit(50);

    return matches;
};

const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);

export default StudentProfile;
