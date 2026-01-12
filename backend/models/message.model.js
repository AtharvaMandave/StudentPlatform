import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        connectionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Connection",
            required: true,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        content: {
            type: String,
            required: true,
            maxlength: 1000,
            trim: true,
        },

        type: {
            type: String,
            enum: ["TEXT", "SYSTEM", "DOUBT", "RESOURCE", "CHECK_IN", "NUDGE", "MILESTONE"],
            default: "TEXT",
        },

        // Metadata for structured messages (DOUBT, RESOURCE, etc.)
        metadata: {
            // For DOUBT messages
            topic: String,
            isResolved: {
                type: Boolean,
                default: false,
            },
            // For RESOURCE messages
            resourceId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SharedResource",
            },
            resourceType: String,
            // For NUDGE messages
            nudgeType: {
                type: String,
                enum: ["STUDY_REMINDER", "CHECKIN_REMINDER", "ENCOURAGEMENT", "CELEBRATION"],
            },
            // For MILESTONE messages
            milestoneId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Milestone",
            },
            badgeName: String,
        },

        isRead: {
            type: Boolean,
            default: false,
        },
        readAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient querying
messageSchema.index({ connectionId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ connectionId: 1, isRead: 1 });

// Pre-save: Validate connection exists and is accepted
messageSchema.pre("save", async function () {
    if (this.isNew && this.type === "TEXT") {
        const Connection = mongoose.model("Connection");
        const connection = await Connection.findById(this.connectionId);

        if (!connection) {
            const error = new Error("Connection not found");
            error.code = "CONNECTION_NOT_FOUND";
            throw error;
        }

        if (connection.status !== "ACCEPTED") {
            const error = new Error("Cannot send message to non-connected user");
            error.code = "NOT_CONNECTED";
            throw error;
        }

        // Validate sender is part of the connection
        const isParticipant =
            connection.requesterId.toString() === this.senderId.toString() ||
            connection.receiverId.toString() === this.senderId.toString();

        if (!isParticipant) {
            const error = new Error("You are not part of this connection");
            error.code = "NOT_PARTICIPANT";
            throw error;
        }
    }
});

// Post-save: Update connection stats
messageSchema.post("save", async function () {
    if (this.type === "TEXT") {
        const Connection = mongoose.model("Connection");
        await Connection.findByIdAndUpdate(this.connectionId, {
            lastInteraction: new Date(),
            $inc: { messageCount: 1 },
        });
    }
});

// Method to mark as read
messageSchema.methods.markAsRead = async function () {
    if (!this.isRead) {
        this.isRead = true;
        this.readAt = new Date();
        await this.save();
    }
    return this;
};

// Static: Get messages for a connection (paginated)
messageSchema.statics.getMessages = async function (connectionId, options = {}) {
    const { page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    const messages = await this.find({ connectionId })
        .populate("senderId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await this.countDocuments({ connectionId });

    return {
        messages: messages.reverse(), // Return in chronological order
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};

// Static: Mark all messages as read for a user in a connection
messageSchema.statics.markAllAsRead = async function (connectionId, userId) {
    const result = await this.updateMany(
        {
            connectionId,
            senderId: { $ne: userId },
            isRead: false,
        },
        {
            isRead: true,
            readAt: new Date(),
        }
    );
    return result.modifiedCount;
};

// Static: Get unread count for a user across all connections
messageSchema.statics.getUnreadCount = async function (userId) {
    const Connection = mongoose.model("Connection");

    // Get all connections where user is involved
    const connections = await Connection.find({
        $or: [{ requesterId: userId }, { receiverId: userId }],
        status: "ACCEPTED",
    });

    const connectionIds = connections.map((c) => c._id);

    // Count unread messages not sent by this user
    const count = await this.countDocuments({
        connectionId: { $in: connectionIds },
        senderId: { $ne: userId },
        isRead: false,
    });

    return count;
};

// Static: Create system message (e.g., "You are now connected")
messageSchema.statics.createSystemMessage = async function (connectionId, content) {
    const Connection = mongoose.model("Connection");
    const connection = await Connection.findById(connectionId);

    if (!connection) throw new Error("Connection not found");

    const message = await this.create({
        connectionId,
        senderId: connection.requesterId, // System messages attributed to requester
        content,
        type: "SYSTEM",
        isRead: true,
    });

    return message;
};

const Message = mongoose.model("Message", messageSchema);

export default Message;
