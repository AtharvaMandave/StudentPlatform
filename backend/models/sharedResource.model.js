import mongoose from "mongoose";

const sharedResourceSchema = new mongoose.Schema(
    {
        connectionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Connection",
            required: true,
        },
        sharedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Resource type
        type: {
            type: String,
            enum: ["NOTE", "ROADMAP", "LINK", "STRATEGY", "FILE", "VIDEO", "ARTICLE", "PRACTICE"],
            required: true,
        },

        // Basic info
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        // Content
        content: {
            type: String,
            maxlength: 5000, // For notes, strategies
        },
        url: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        fileUrl: {
            type: String,
            trim: true,
        },
        fileName: {
            type: String,
            trim: true,
        },
        fileSize: {
            type: Number, // in bytes
            max: 5 * 1024 * 1024, // 5MB max
        },
        fileType: {
            type: String,
            enum: ["PDF", "IMAGE", "MARKDOWN", "TEXT", "OTHER"],
        },

        // Categorization
        topic: {
            type: String,
            trim: true,
            maxlength: 100,
        },
        tags: [{
            type: String,
            trim: true,
            maxlength: 30,
        }],
        difficulty: {
            type: String,
            enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
        },

        // Quality & Usefulness
        rating: {
            averageRating: {
                type: Number,
                min: 0,
                max: 5,
                default: 0,
            },
            totalRatings: {
                type: Number,
                default: 0,
            },
        },
        helpfulCount: {
            type: Number,
            default: 0,
        },
        viewCount: {
            type: Number,
            default: 0,
        },

        // Partner feedback
        partnerReaction: {
            type: String,
            enum: ["HELPFUL", "NEUTRAL", "NOT_USEFUL"],
        },
        partnerNote: {
            type: String,
            maxlength: 300,
        },

        // Public contribution
        isPublicContribution: {
            type: Boolean,
            default: false,
        },
        publicContributionStatus: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
        },
        publicContributionDate: Date,

        // Status
        isActive: {
            type: Boolean,
            default: true,
        },
        isPinned: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
sharedResourceSchema.index({ connectionId: 1, createdAt: -1 });
sharedResourceSchema.index({ sharedBy: 1 });
sharedResourceSchema.index({ type: 1 });
sharedResourceSchema.index({ topic: 1 });
sharedResourceSchema.index({ isPublicContribution: 1, publicContributionStatus: 1 });
sharedResourceSchema.index({ tags: 1 });

// Virtual: Is link resource
sharedResourceSchema.virtual("isLink").get(function () {
    return this.type === "LINK" || this.type === "VIDEO" || this.type === "ARTICLE";
});

// Virtual: Is file resource
sharedResourceSchema.virtual("isFile").get(function () {
    return !!this.fileUrl;
});

// Pre-save: Validate based on type
sharedResourceSchema.pre("save", function (next) {
    // Links must have URL
    if (["LINK", "VIDEO", "ARTICLE"].includes(this.type) && !this.url) {
        return next(new Error("URL is required for link-type resources"));
    }

    // Notes/Strategies must have content
    if (["NOTE", "STRATEGY"].includes(this.type) && !this.content && !this.fileUrl) {
        return next(new Error("Content or file is required for this resource type"));
    }

    // Limit tags
    if (this.tags && this.tags.length > 5) {
        this.tags = this.tags.slice(0, 5);
    }

    next();
});

// Method: Mark as helpful
sharedResourceSchema.methods.markHelpful = async function () {
    this.helpfulCount += 1;
    await this.save();
    return this;
};

// Method: Increment view
sharedResourceSchema.methods.incrementView = async function () {
    this.viewCount += 1;
    await this.save();
};

// Method: Add partner reaction
sharedResourceSchema.methods.addPartnerReaction = async function (reaction, note = "") {
    this.partnerReaction = reaction;
    if (note) this.partnerNote = note;
    if (reaction === "HELPFUL") this.helpfulCount += 1;
    await this.save();
    return this;
};

// Method: Request public contribution
sharedResourceSchema.methods.requestPublicContribution = async function () {
    this.isPublicContribution = true;
    this.publicContributionStatus = "PENDING";
    this.publicContributionDate = new Date();
    await this.save();
    return this;
};

// Static: Get resources for connection
sharedResourceSchema.statics.getConnectionResources = async function (connectionId, options = {}) {
    const { type, topic, limit = 50, page = 1 } = options;

    const query = { connectionId, isActive: true };
    if (type) query.type = type;
    if (topic) query.topic = { $regex: topic, $options: "i" };

    const skip = (page - 1) * limit;

    const resources = await this.find(query)
        .populate("sharedBy", "name")
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await this.countDocuments(query);

    return {
        resources,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};

// Static: Get user's shared resources
sharedResourceSchema.statics.getUserResources = async function (userId, options = {}) {
    const { limit = 50 } = options;

    return this.find({ sharedBy: userId, isActive: true })
        .populate("connectionId")
        .sort({ createdAt: -1 })
        .limit(limit);
};

// Static: Get public contributions
sharedResourceSchema.statics.getPublicContributions = async function (options = {}) {
    const { topic, type, limit = 20, page = 1 } = options;

    const query = {
        isPublicContribution: true,
        publicContributionStatus: "APPROVED",
        isActive: true,
    };
    if (topic) query.topic = { $regex: topic, $options: "i" };
    if (type) query.type = type;

    const skip = (page - 1) * limit;

    return this.find(query)
        .populate("sharedBy", "name")
        .sort({ helpfulCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

// Static: Get resource stats for user
sharedResourceSchema.statics.getUserStats = async function (userId) {
    const resources = await this.find({ sharedBy: userId, isActive: true });

    return {
        totalShared: resources.length,
        totalHelpful: resources.reduce((sum, r) => sum + (r.helpfulCount || 0), 0),
        totalViews: resources.reduce((sum, r) => sum + (r.viewCount || 0), 0),
        publicContributions: resources.filter(r => r.publicContributionStatus === "APPROVED").length,
        byType: resources.reduce((acc, r) => {
            acc[r.type] = (acc[r.type] || 0) + 1;
            return acc;
        }, {}),
    };
};

// Static: Search resources
sharedResourceSchema.statics.search = async function (query, options = {}) {
    const { connectionId, limit = 20 } = options;

    const searchQuery = {
        isActive: true,
        $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { topic: { $regex: query, $options: "i" } },
            { tags: { $in: [new RegExp(query, "i")] } },
        ],
    };

    if (connectionId) searchQuery.connectionId = connectionId;

    return this.find(searchQuery)
        .populate("sharedBy", "name")
        .sort({ helpfulCount: -1 })
        .limit(limit);
};

const SharedResource = mongoose.model("SharedResource", sharedResourceSchema);

export default SharedResource;
