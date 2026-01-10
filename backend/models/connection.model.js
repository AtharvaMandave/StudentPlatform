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
            enum: ["PENDING", "ACCEPTED", "REJECTED", "BLOCKED"],
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
