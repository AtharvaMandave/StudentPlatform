import Message from "../models/message.model.js";
import Connection from "../models/connection.model.js";

/**
 * Get messages for a connection (paginated)
 */
export const getMessages = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const { page = 1, limit = 50 } = req.query;

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

        const result = await Message.getMessages(connectionId, {
            page: parseInt(page),
            limit: parseInt(limit),
        });

        // Mark messages as read
        await Message.markAllAsRead(connectionId, req.user._id);

        res.json({
            success: true,
            data: {
                messages: result.messages,
                pagination: result.pagination,
                connection: {
                    id: connection._id,
                    connectedAt: connection.connectedAt,
                    lastInteraction: connection.lastInteraction,
                },
            },
        });
    } catch (error) {
        console.error("Get messages error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch messages",
        });
    }
};

/**
 * Send a message
 */
export const sendMessage = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const { content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Message content is required",
            });
        }

        if (content.length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Message too long (max 1000 characters)",
            });
        }

        // Verify connection exists and user is part of it
        const connection = await Connection.findOne({
            _id: connectionId,
            status: "ACCEPTED",
            $or: [{ requesterId: req.user._id }, { receiverId: req.user._id }],
        });

        if (!connection) {
            return res.status(403).json({
                success: false,
                message: "You cannot send messages in this connection",
            });
        }

        // Create message
        const message = await Message.create({
            connectionId,
            senderId: req.user._id,
            content: content.trim(),
            type: "TEXT",
        });

        // Populate sender info
        await message.populate("senderId", "name");

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: message,
        });
    } catch (error) {
        console.error("Send message error:", error);

        if (error.code === "NOT_CONNECTED") {
            return res.status(403).json({
                success: false,
                message: "Cannot send message to non-connected user",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to send message",
        });
    }
};

/**
 * Mark messages as read
 */
export const markAsRead = async (req, res) => {
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

        const count = await Message.markAllAsRead(connectionId, req.user._id);

        res.json({
            success: true,
            message: `${count} messages marked as read`,
        });
    } catch (error) {
        console.error("Mark as read error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to mark messages as read",
        });
    }
};

/**
 * Get unread message count across all connections
 */
export const getUnreadCount = async (req, res) => {
    try {
        const count = await Message.getUnreadCount(req.user._id);

        res.json({
            success: true,
            data: { unreadCount: count },
        });
    } catch (error) {
        console.error("Get unread count error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get unread count",
        });
    }
};

export default {
    getMessages,
    sendMessage,
    markAsRead,
    getUnreadCount,
};
