import mongoose from "mongoose";

const checklistItemSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 300,
    },
    studentAStatus: {
        type: String,
        enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"],
        default: "NOT_STARTED",
    },
    studentBStatus: {
        type: String,
        enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"],
        default: "NOT_STARTED",
    },
    studentACompletedAt: Date,
    studentBCompletedAt: Date,
    dueDate: Date,
    order: {
        type: Number,
        default: 0,
    },
}, { _id: true });

const weeklyScheduleSchema = new mongoose.Schema({
    day: {
        type: String,
        enum: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
        required: true,
    },
    timeSlot: {
        start: String, // e.g., "09:00"
        end: String,   // e.g., "11:00"
    },
    topics: [{
        type: String,
        trim: true,
    }],
    isActive: {
        type: Boolean,
        default: true,
    },
}, { _id: true });

const studyPlanSchema = new mongoose.Schema(
    {
        connectionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Connection",
            required: true,
            unique: true,
        },
        // Student references (derived from connection)
        studentA: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        studentB: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Shared Goal
        sharedGoal: {
            type: String,
            enum: ["DSA", "WEB_DEV", "HIGHER_STUDIES", "UPSC", "GATE", "PLACEMENTS", "OTHER"],
            required: true,
        },
        customGoal: {
            type: String,
            trim: true,
            maxlength: 100,
        },

        // Short-term Target (1-2 weeks)
        shortTermTarget: {
            description: {
                type: String,
                trim: true,
                maxlength: 200,
            },
            deadline: Date,
            topics: [{
                type: String,
                trim: true,
            }],
            status: {
                type: String,
                enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"],
                default: "NOT_STARTED",
            },
        },

        // Long-term Target (1-3 months)
        longTermTarget: {
            description: {
                type: String,
                trim: true,
                maxlength: 300,
            },
            deadline: Date,
            topics: [{
                type: String,
                trim: true,
            }],
            milestones: [{
                title: String,
                targetDate: Date,
                completed: {
                    type: Boolean,
                    default: false,
                },
            }],
            status: {
                type: String,
                enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"],
                default: "NOT_STARTED",
            },
        },

        // Weekly Schedule
        weeklySchedule: [weeklyScheduleSchema],

        // Shared Checklist
        checklist: [checklistItemSchema],

        // Study Preferences
        preferences: {
            studyDays: [{
                type: String,
                enum: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
            }],
            dailyHours: {
                type: Number,
                min: 0.5,
                max: 12,
                default: 2,
            },
            preferredTime: {
                type: String,
                enum: ["MORNING", "AFTERNOON", "EVENING", "NIGHT", "FLEXIBLE"],
                default: "FLEXIBLE",
            },
            communicationFrequency: {
                type: String,
                enum: ["DAILY", "EVERY_OTHER_DAY", "WEEKLY", "AS_NEEDED"],
                default: "DAILY",
            },
        },

        // Metadata
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        lastUpdatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        version: {
            type: Number,
            default: 1,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
studyPlanSchema.index({ connectionId: 1 });
studyPlanSchema.index({ studentA: 1, studentB: 1 });
studyPlanSchema.index({ sharedGoal: 1 });

// Virtual: Get completion percentage of checklist
studyPlanSchema.virtual("checklistProgress").get(function () {
    if (!this.checklist || this.checklist.length === 0) return { studentA: 0, studentB: 0, overall: 0 };

    const total = this.checklist.length;
    const studentACompleted = this.checklist.filter(item => item.studentAStatus === "COMPLETED").length;
    const studentBCompleted = this.checklist.filter(item => item.studentBStatus === "COMPLETED").length;

    return {
        studentA: Math.round((studentACompleted / total) * 100),
        studentB: Math.round((studentBCompleted / total) * 100),
        overall: Math.round(((studentACompleted + studentBCompleted) / (total * 2)) * 100),
    };
});

// Method: Add checklist item
studyPlanSchema.methods.addChecklistItem = async function (item, userId) {
    const order = this.checklist.length;
    this.checklist.push({ ...item, order });
    this.lastUpdatedBy = userId;
    await this.save();
    return this.checklist[this.checklist.length - 1];
};

// Method: Update checklist item status
studyPlanSchema.methods.updateChecklistStatus = async function (itemId, userId, status) {
    const item = this.checklist.id(itemId);
    if (!item) throw new Error("Checklist item not found");

    const isStudentA = this.studentA.toString() === userId.toString();
    const isStudentB = this.studentB.toString() === userId.toString();

    if (!isStudentA && !isStudentB) {
        throw new Error("User is not part of this study plan");
    }

    if (isStudentA) {
        item.studentAStatus = status;
        if (status === "COMPLETED") item.studentACompletedAt = new Date();
    } else {
        item.studentBStatus = status;
        if (status === "COMPLETED") item.studentBCompletedAt = new Date();
    }

    this.lastUpdatedBy = userId;
    await this.save();
    return item;
};

// Method: Remove checklist item
studyPlanSchema.methods.removeChecklistItem = async function (itemId, userId) {
    this.checklist.pull(itemId);
    this.lastUpdatedBy = userId;
    await this.save();
};

// Static: Get plan by connection
studyPlanSchema.statics.getByConnection = async function (connectionId) {
    return this.findOne({ connectionId, isActive: true })
        .populate("studentA", "name email")
        .populate("studentB", "name email")
        .populate("createdBy", "name")
        .populate("lastUpdatedBy", "name");
};

// Static: Create plan from connection
studyPlanSchema.statics.createFromConnection = async function (connectionId, createdBy, planData) {
    const Connection = mongoose.model("Connection");
    const connection = await Connection.findById(connectionId);

    if (!connection || connection.status !== "ACCEPTED") {
        throw new Error("Invalid or inactive connection");
    }

    const plan = await this.create({
        connectionId,
        studentA: connection.requesterId,
        studentB: connection.receiverId,
        createdBy,
        ...planData,
    });

    return plan;
};

const StudyPlan = mongoose.model("StudyPlan", studyPlanSchema);

export default StudyPlan;
