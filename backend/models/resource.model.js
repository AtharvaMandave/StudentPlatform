import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
    connectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Connection',
        required: true,
        index: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['FILE', 'LINK', 'NOTE', 'GOOGLE_DOC'],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    // For files
    fileUrl: {
        type: String
    },
    fileName: {
        type: String
    },
    fileSize: {
        type: Number // in bytes
    },
    mimeType: {
        type: String
    },
    // For links/docs
    url: {
        type: String
    },
    // Tags for organization
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    // Topic categorization
    topic: {
        type: String,
        enum: ['DSA', 'WEB_DEV', 'SYSTEM_DESIGN', 'DATABASE', 'ALGORITHMS', 'INTERVIEW_PREP', 'THEORY', 'PRACTICE', 'OTHER'],
        default: 'OTHER'
    },
    // Bookmarked by users
    bookmarkedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Notes/comments
    notes: {
        type: String
    },
    // Metadata
    isArchived: {
        type: Boolean,
        default: false
    },
    viewCount: {
        type: Number,
        default: 0
    },
    lastAccessedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes
resourceSchema.index({ connectionId: 1, createdAt: -1 });
resourceSchema.index({ connectionId: 1, type: 1 });
resourceSchema.index({ connectionId: 1, topic: 1 });
resourceSchema.index({ tags: 1 });

// Methods
resourceSchema.methods.incrementView = async function () {
    this.viewCount += 1;
    this.lastAccessedAt = new Date();
    return this.save();
};

resourceSchema.methods.toggleBookmark = async function (userId) {
    const index = this.bookmarkedBy.indexOf(userId);
    if (index > -1) {
        this.bookmarkedBy.splice(index, 1);
    } else {
        this.bookmarkedBy.push(userId);
    }
    return this.save();
};

// Statics
resourceSchema.statics.getByConnection = async function (connectionId, filters = {}) {
    const query = { connectionId, isArchived: false };

    if (filters.type) query.type = filters.type;
    if (filters.topic) query.topic = filters.topic;
    if (filters.tags && filters.tags.length > 0) query.tags = { $in: filters.tags };

    return this.find(query)
        .populate('uploadedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(filters.limit || 50);
};

resourceSchema.statics.getBookmarked = async function (connectionId, userId) {
    return this.find({
        connectionId,
        bookmarkedBy: userId,
        isArchived: false
    })
        .populate('uploadedBy', 'name email')
        .sort({ createdAt: -1 });
};

resourceSchema.statics.searchResources = async function (connectionId, searchTerm) {
    return this.find({
        connectionId,
        isArchived: false,
        $or: [
            { title: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { tags: { $regex: searchTerm, $options: 'i' } }
        ]
    })
        .populate('uploadedBy', 'name email')
        .sort({ createdAt: -1 });
};

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;
