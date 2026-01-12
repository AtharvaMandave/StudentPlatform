import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
    {
        requesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        status: {
            type: String,
            enum: ["PENDING", "ACCEPTED", "REJECTED", "BLOCKED", "UNMATCHED"],
            default: "PENDING",
        },

        // Matching Info
        matchScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        matchReasons: [{
            type: String,
        }],

        // Request Details
        requestMessage: {
            type: String,
            maxlength: 200,
            trim: true,
        },

        // Connection Stats (populated after acceptance)
        connectedAt: {
            type: Date,
        },
        lastInteraction: {
            type: Date,
        },
        messageCount: {
            type: Number,
            default: 0,
        },

        // Rejection/Block reason (optional)
        actionReason: {
            type: String,
            maxlength: 200,
        },

        // Onboarding Status (Phase 1 Enhancement)
        onboarding: {
            isComplete: {
                type: Boolean,
                default: false,
            },
            requesterComplete: {
                type: Boolean,
                default: false,
            },
            receiverComplete: {
                type: Boolean,
                default: false,
            },
            completedAt: Date,
            preferences: {
                primaryGoal: String,
                studyFrequency: {
                    type: String,
                    enum: ["DAILY", "EVERY_OTHER_DAY", "WEEKENDS", "WEEKLY"],
                },
                communicationExpectations: {
                    type: String,
                    enum: ["HIGH", "MEDIUM", "LOW"],
                },
            },
        },

        // Study Plan Reference
        studyPlanId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StudyPlan",
        },

        // Connection Health Reference
        connectionHealthId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ConnectionHealth",
        },

        // Unmatch tracking
        unmatchedAt: Date,
        unmatchReason: {
            type: String,
            enum: ["DIFFERENT_PACE", "TIME_MISMATCH", "GOAL_CHANGE", "INACTIVE", "PERSONAL", "OTHER"],
        },
        unmatchedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        progressPreserved: {
            type: Boolean,
            default: true,
        },
        canRematch: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
connectionSchema.index({ requesterId: 1, receiverId: 1 }, { unique: true });
connectionSchema.index({ requesterId: 1, status: 1 });
connectionSchema.index({ receiverId: 1, status: 1 });
connectionSchema.index({ status: 1 });

// Prevent duplicate connections (either direction)
connectionSchema.pre("save", async function () {
    if (this.isNew) {
        // Check if connection already exists in either direction
        const existingConnection = await mongoose.model("Connection").findOne({
            $or: [
                { requesterId: this.requesterId, receiverId: this.receiverId },
                { requesterId: this.receiverId, receiverId: this.requesterId },
            ],
        });

        if (existingConnection) {
            const error = new Error("Connection already exists between these users");
            error.code = "DUPLICATE_CONNECTION";
            throw error;
        }

        // Prevent self-connection
        if (this.requesterId.toString() === this.receiverId.toString()) {
            const error = new Error("Cannot connect with yourself");
            error.code = "SELF_CONNECTION";
            throw error;
        }
    }
});

// Method to accept connection
connectionSchema.methods.accept = async function () {
    const StudentProfile = mongoose.model("StudentProfile");

    this.status = "ACCEPTED";
    this.connectedAt = new Date();
    this.lastInteraction = new Date();
    await this.save();

    // Increment partner count for both users
    await StudentProfile.updateOne(
        { userId: this.requesterId },
        { $inc: { activePartnersCount: 1 } }
    );
    await StudentProfile.updateOne(
        { userId: this.receiverId },
        { $inc: { activePartnersCount: 1 } }
    );

    return this;
};

// Method to reject connection
connectionSchema.methods.reject = async function (reason = null) {
    this.status = "REJECTED";
    if (reason) this.actionReason = reason;
    await this.save();
    return this;
};

// Method to block user
connectionSchema.methods.block = async function (reason = null) {
    const StudentProfile = mongoose.model("StudentProfile");
    const wasAccepted = this.status === "ACCEPTED";

    this.status = "BLOCKED";
    if (reason) this.actionReason = reason;
    await this.save();

    // If was connected, decrement partner count
    if (wasAccepted) {
        await StudentProfile.updateOne(
            { userId: this.requesterId },
            { $inc: { activePartnersCount: -1 } }
        );
        await StudentProfile.updateOne(
            { userId: this.receiverId },
            { $inc: { activePartnersCount: -1 } }
        );
    }

    return this;
};

// Method to unmatch (graceful disconnection)
connectionSchema.methods.unmatch = async function (userId, reason = "OTHER", preserveProgress = true) {
    const StudentProfile = mongoose.model("StudentProfile");
    const wasAccepted = this.status === "ACCEPTED";

    this.status = "UNMATCHED";
    this.unmatchedAt = new Date();
    this.unmatchedBy = userId;
    this.unmatchReason = reason;
    this.progressPreserved = preserveProgress;
    await this.save();

    // Decrement partner count
    if (wasAccepted) {
        await StudentProfile.updateOne(
            { userId: this.requesterId },
            { $inc: { activePartnersCount: -1 } }
        );
        await StudentProfile.updateOne(
            { userId: this.receiverId },
            { $inc: { activePartnersCount: -1 } }
        );
    }

    return this;
};

// Method to complete onboarding for a user
connectionSchema.methods.completeOnboarding = async function (userId, preferences = {}) {
    const isRequester = this.requesterId.toString() === userId.toString();
    const isReceiver = this.receiverId.toString() === userId.toString();

    if (!isRequester && !isReceiver) {
        throw new Error("User is not part of this connection");
    }

    if (isRequester) {
        this.onboarding.requesterComplete = true;
    } else {
        this.onboarding.receiverComplete = true;
    }

    // Merge preferences
    if (preferences.primaryGoal) {
        this.onboarding.preferences.primaryGoal = preferences.primaryGoal;
    }
    if (preferences.studyFrequency) {
        this.onboarding.preferences.studyFrequency = preferences.studyFrequency;
    }
    if (preferences.communicationExpectations) {
        this.onboarding.preferences.communicationExpectations = preferences.communicationExpectations;
    }

    // Check if both completed
    if (this.onboarding.requesterComplete && this.onboarding.receiverComplete) {
        this.onboarding.isComplete = true;
        this.onboarding.completedAt = new Date();
    }

    await this.save();
    return this;
};

// Static: Get pending requests for a user
connectionSchema.statics.getPendingRequests = async function (userId) {
    return this.find({
        receiverId: userId,
        status: "PENDING",
    })
        .populate("requesterId", "name email")
        .sort({ createdAt: -1 });
};

// Static: Get sent requests for a user
connectionSchema.statics.getSentRequests = async function (userId) {
    return this.find({
        requesterId: userId,
        status: "PENDING",
    })
        .populate("receiverId", "name email")
        .sort({ createdAt: -1 });
};

// Static: Get connected partners for a user
connectionSchema.statics.getPartners = async function (userId) {
    return this.find({
        $or: [{ requesterId: userId }, { receiverId: userId }],
        status: "ACCEPTED",
    })
        .populate("requesterId", "name email")
        .populate("receiverId", "name email")
        .sort({ lastInteraction: -1 });
};

// Static: Check if two users are connected
connectionSchema.statics.areConnected = async function (userId1, userId2) {
    const connection = await this.findOne({
        $or: [
            { requesterId: userId1, receiverId: userId2 },
            { requesterId: userId2, receiverId: userId1 },
        ],
        status: "ACCEPTED",
    });
    return !!connection;
};

// Static: Check if user is blocked
connectionSchema.statics.isBlocked = async function (userId1, userId2) {
    const connection = await this.findOne({
        $or: [
            { requesterId: userId1, receiverId: userId2 },
            { requesterId: userId2, receiverId: userId1 },
        ],
        status: "BLOCKED",
    });
    return !!connection;
};

const Connection = mongoose.model("Connection", connectionSchema);

export default Connection;
