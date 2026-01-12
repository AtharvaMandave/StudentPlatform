import mongoose from "mongoose";

const weeklyCheckInSchema = new mongoose.Schema(
    {
        connectionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Connection",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Week reference (start of the week - Monday)
        weekOf: {
            type: Date,
            required: true,
        },
        weekNumber: {
            type: Number,
            min: 1,
            max: 53,
        },
        year: {
            type: Number,
        },

        // What was accomplished
        completedTopics: [{
            topic: {
                type: String,
                trim: true,
                maxlength: 100,
            },
            hoursSpent: {
                type: Number,
                min: 0,
            },
            difficulty: {
                type: String,
                enum: ["EASY", "MEDIUM", "HARD"],
            },
            notes: {
                type: String,
                maxlength: 300,
            },
        }],

        // Summary stats
        totalHoursStudied: {
            type: Number,
            default: 0,
            min: 0,
        },
        tasksCompleted: {
            type: Number,
            default: 0,
            min: 0,
        },
        goalsMet: {
            type: Boolean,
            default: false,
        },

        // Reflection prompts
        reflection: {
            whatWentWell: {
                type: String,
                trim: true,
                maxlength: 500,
            },
            challenges: {
                type: String,
                trim: true,
                maxlength: 500,
            },
            learnings: {
                type: String,
                trim: true,
                maxlength: 500,
            },
            improvements: {
                type: String,
                trim: true,
                maxlength: 500,
            },
        },

        // Next week planning
        nextWeekPlan: {
            goals: [{
                type: String,
                trim: true,
                maxlength: 200,
            }],
            focusTopics: [{
                type: String,
                trim: true,
                maxlength: 100,
            }],
            targetHours: {
                type: Number,
                min: 0,
                max: 80,
            },
        },

        // Mood & Energy
        weeklyMood: {
            type: String,
            enum: ["GREAT", "GOOD", "OKAY", "STRUGGLING", "BURNED_OUT"],
        },
        energyLevel: {
            type: Number,
            min: 1,
            max: 5,
        },

        // Partner interaction
        partnerInteraction: {
            helpedPartner: Boolean,
            receivedHelp: Boolean,
            discussedTopics: [{
                type: String,
                trim: true,
            }],
            interactionRating: {
                type: Number,
                min: 1,
                max: 5,
            },
        },

        // Visibility settings
        visibility: {
            type: String,
            enum: ["PARTNER_ONLY", "BOTH", "PRIVATE"],
            default: "BOTH",
        },

        // Status
        status: {
            type: String,
            enum: ["DRAFT", "SUBMITTED"],
            default: "DRAFT",
        },
        submittedAt: Date,
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure one check-in per user per week per connection
weeklyCheckInSchema.index(
    { connectionId: 1, userId: 1, weekOf: 1 },
    { unique: true }
);
weeklyCheckInSchema.index({ userId: 1, weekOf: -1 });
weeklyCheckInSchema.index({ connectionId: 1, weekOf: -1 });

// Pre-save: Calculate week number and year
weeklyCheckInSchema.pre("save", async function () {
    if (this.weekOf) {
        const date = new Date(this.weekOf);
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
        this.weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        this.year = date.getFullYear();
    }
});

// Method: Submit check-in
weeklyCheckInSchema.methods.submit = async function () {
    this.status = "SUBMITTED";
    this.submittedAt = new Date();
    await this.save();
    return this;
};

// Static: Get check-ins for a connection
weeklyCheckInSchema.statics.getConnectionCheckIns = async function (connectionId, options = {}) {
    const { limit = 12, userId = null } = options;

    const query = { connectionId, status: "SUBMITTED" };
    if (userId) query.userId = userId;

    return this.find(query)
        .populate("userId", "name")
        .sort({ weekOf: -1 })
        .limit(limit);
};

// Static: Get user's check-ins
weeklyCheckInSchema.statics.getUserCheckIns = async function (userId, options = {}) {
    const { limit = 12 } = options;

    return this.find({ userId, status: "SUBMITTED" })
        .populate("connectionId")
        .sort({ weekOf: -1 })
        .limit(limit);
};

// Static: Get or create check-in for current week
weeklyCheckInSchema.statics.getOrCreateForWeek = async function (connectionId, userId) {
    // Get Monday of current week
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    let checkIn = await this.findOne({
        connectionId,
        userId,
        weekOf: monday,
    });

    if (!checkIn) {
        checkIn = await this.create({
            connectionId,
            userId,
            weekOf: monday,
            status: "DRAFT",
        });
    }

    return checkIn;
};

// Static: Get partner's check-in for the week
weeklyCheckInSchema.statics.getPartnerCheckIn = async function (connectionId, excludeUserId, weekOf) {
    return this.findOne({
        connectionId,
        userId: { $ne: excludeUserId },
        weekOf,
        status: "SUBMITTED",
        visibility: { $in: ["PARTNER_ONLY", "BOTH"] },
    }).populate("userId", "name");
};

// Static: Get check-in stats for a user
weeklyCheckInSchema.statics.getStats = async function (userId) {
    const checkIns = await this.find({ userId, status: "SUBMITTED" });

    if (checkIns.length === 0) {
        return {
            totalCheckIns: 0,
            averageHours: 0,
            averageTasks: 0,
            goalsMetPercentage: 0,
            streakWeeks: 0,
        };
    }

    const totalHours = checkIns.reduce((sum, c) => sum + (c.totalHoursStudied || 0), 0);
    const totalTasks = checkIns.reduce((sum, c) => sum + (c.tasksCompleted || 0), 0);
    const goalsMet = checkIns.filter(c => c.goalsMet).length;

    // Calculate streak (consecutive weeks)
    const sortedCheckIns = checkIns.sort((a, b) => new Date(b.weekOf) - new Date(a.weekOf));
    let streakWeeks = 0;
    let currentWeek = new Date();

    for (const checkIn of sortedCheckIns) {
        const checkInWeek = new Date(checkIn.weekOf);
        const diffDays = Math.floor((currentWeek - checkInWeek) / (1000 * 60 * 60 * 24));

        if (diffDays <= 7 * (streakWeeks + 1)) {
            streakWeeks++;
            currentWeek = checkInWeek;
        } else {
            break;
        }
    }

    return {
        totalCheckIns: checkIns.length,
        averageHours: Math.round(totalHours / checkIns.length * 10) / 10,
        averageTasks: Math.round(totalTasks / checkIns.length * 10) / 10,
        goalsMetPercentage: Math.round((goalsMet / checkIns.length) * 100),
        streakWeeks,
    };
};

// Static prompts for check-in
weeklyCheckInSchema.statics.getPrompts = function () {
    return {
        whatWentWell: [
            "What topics did you understand well this week?",
            "What study methods worked best?",
            "Any 'aha!' moments?",
        ],
        challenges: [
            "What concepts were difficult?",
            "What slowed you down?",
            "Where do you need more practice?",
        ],
        learnings: [
            "What's the most important thing you learned?",
            "What surprised you?",
            "What would you teach someone else?",
        ],
        improvements: [
            "What will you do differently next week?",
            "What habits do you want to build?",
            "How can your partner help?",
        ],
    };
};

const WeeklyCheckIn = mongoose.model("WeeklyCheckIn", weeklyCheckInSchema);

export default WeeklyCheckIn;
