import Resource from "../models/resource.model.js";
import Connection from "../models/connection.model.js";

/**
 * Get all resources for a connection
 * @route GET /api/connect/resources/:connectionId
 */
export const getResources = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const { type, topic, tags } = req.query;

        // Verify user is part of this connection
        const connection = await Connection.findOne({
            _id: connectionId,
            status: "ACCEPTED",
            $or: [{ requesterId: req.user._id }, { receiverId: req.user._id }],
        });

        if (!connection) {
            return res.status(403).json({
                success: false,
                message: "You are not part of this connection",
            });
        }

        const filters = {};
        if (type) filters.type = type;
        if (topic) filters.topic = topic;
        if (tags) filters.tags = tags.split(',');

        const resources = await Resource.getByConnection(connectionId, filters);

        res.json({
            success: true,
            data: resources,
        });
    } catch (error) {
        console.error("Get resources error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch resources",
        });
    }
};

/**
 * Create a new resource
 * @route POST /api/connect/resources/:connectionId
 */
export const createResource = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const { type, title, description, url, tags, topic, notes } = req.body;

        // Verify user is part of this connection
        const connection = await Connection.findOne({
            _id: connectionId,
            status: "ACCEPTED",
            $or: [{ requesterId: req.user._id }, { receiverId: req.user._id }],
        });

        if (!connection) {
            return res.status(403).json({
                success: false,
                message: "You are not part of this connection",
            });
        }

        // Validate required fields
        if (!type || !title) {
            return res.status(400).json({
                success: false,
                message: "Type and title are required",
            });
        }

        if ((type === 'LINK' || type === 'GOOGLE_DOC') && !url) {
            return res.status(400).json({
                success: false,
                message: "URL is required for links and Google Docs",
            });
        }

        const resource = await Resource.create({
            connectionId,
            uploadedBy: req.user._id,
            type,
            title,
            description,
            url,
            tags: tags || [],
            topic: topic || 'OTHER',
            notes
        });

        await resource.populate('uploadedBy', 'name email');

        res.status(201).json({
            success: true,
            data: resource,
            message: "Resource added successfully",
        });
    } catch (error) {
        console.error("Create resource error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create resource",
        });
    }
};

/**
 * Update a resource
 * @route PUT /api/connect/resources/:connectionId/:resourceId
 */
export const updateResource = async (req, res) => {
    try {
        const { connectionId, resourceId } = req.params;
        const { title, description, tags, topic, notes } = req.body;

        const resource = await Resource.findOne({
            _id: resourceId,
            connectionId
        });

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found",
            });
        }

        // Update fields
        if (title) resource.title = title;
        if (description !== undefined) resource.description = description;
        if (tags) resource.tags = tags;
        if (topic) resource.topic = topic;
        if (notes !== undefined) resource.notes = notes;

        await resource.save();
        await resource.populate('uploadedBy', 'name email');

        res.json({
            success: true,
            data: resource,
            message: "Resource updated successfully",
        });
    } catch (error) {
        console.error("Update resource error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update resource",
        });
    }
};

/**
 * Delete a resource
 * @route DELETE /api/connect/resources/:connectionId/:resourceId
 */
export const deleteResource = async (req, res) => {
    try {
        const { connectionId, resourceId } = req.params;

        const resource = await Resource.findOne({
            _id: resourceId,
            connectionId
        });

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found",
            });
        }

        // Only uploader can delete
        if (resource.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only the uploader can delete this resource",
            });
        }

        await resource.deleteOne();

        res.json({
            success: true,
            message: "Resource deleted successfully",
        });
    } catch (error) {
        console.error("Delete resource error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete resource",
        });
    }
};

/**
 * Toggle bookmark on a resource
 * @route POST /api/connect/resources/:connectionId/:resourceId/bookmark
 */
export const toggleBookmark = async (req, res) => {
    try {
        const { connectionId, resourceId } = req.params;

        const resource = await Resource.findOne({
            _id: resourceId,
            connectionId
        });

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found",
            });
        }

        await resource.toggleBookmark(req.user._id);
        await resource.populate('uploadedBy', 'name email');

        const isBookmarked = resource.bookmarkedBy.includes(req.user._id);

        res.json({
            success: true,
            data: resource,
            message: isBookmarked ? "Bookmarked" : "Bookmark removed",
        });
    } catch (error) {
        console.error("Toggle bookmark error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to toggle bookmark",
        });
    }
};

/**
 * Get bookmarked resources
 * @route GET /api/connect/resources/:connectionId/bookmarked
 */
export const getBookmarkedResources = async (req, res) => {
    try {
        const { connectionId } = req.params;

        // Verify user is part of this connection
        const connection = await Connection.findOne({
            _id: connectionId,
            status: "ACCEPTED",
            $or: [{ requesterId: req.user._id }, { receiverId: req.user._id }],
        });

        if (!connection) {
            return res.status(403).json({
                success: false,
                message: "You are not part of this connection",
            });
        }

        const resources = await Resource.getBookmarked(connectionId, req.user._id);

        res.json({
            success: true,
            data: resources,
        });
    } catch (error) {
        console.error("Get bookmarked resources error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bookmarked resources",
        });
    }
};

/**
 * Search resources
 * @route GET /api/connect/resources/:connectionId/search
 */
export const searchResources = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: "Search query is required",
            });
        }

        const resources = await Resource.searchResources(connectionId, q);

        res.json({
            success: true,
            data: resources,
        });
    } catch (error) {
        console.error("Search resources error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to search resources",
        });
    }
};

/**
 * Increment view count
 * @route POST /api/connect/resources/:connectionId/:resourceId/view
 */
export const incrementView = async (req, res) => {
    try {
        const { connectionId, resourceId } = req.params;

        const resource = await Resource.findOne({
            _id: resourceId,
            connectionId
        });

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found",
            });
        }

        await resource.incrementView();

        res.json({
            success: true,
            data: { viewCount: resource.viewCount },
        });
    } catch (error) {
        console.error("Increment view error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to increment view",
        });
    }
};

export default {
    getResources,
    createResource,
    updateResource,
    deleteResource,
    toggleBookmark,
    getBookmarkedResources,
    searchResources,
    incrementView,
};
