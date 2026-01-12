import Connection from "../models/connection.model.js";
import StudentProfile from "../models/studentProfile.model.js";
import Message from "../models/message.model.js";
import { getMatchScoreBetween } from "../services/matching.service.js";

/**
 * Send a connection request
 */
export const sendRequest = async (req, res) => {
    try {
        const { userId } = req.params;
        const { message } = req.body;

        // Validate not sending to self
        if (userId === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot send a request to yourself",
            });
        }

        // Check if receiver exists and has complete profile
        const receiverProfile = await StudentProfile.findOne({
            userId,
            isProfileComplete: true,
        });

        if (!receiverProfile) {
            return res.status(404).json({
                success: false,
                message: "User not found or profile incomplete",
            });
        }

        // Check receiver's privacy settings
        if (receiverProfile.settings.allowRequests === "NONE") {
            return res.status(403).json({
                success: false,
                message: "This user is not accepting connection requests",
            });
        }

        // Check if sender has complete profile
        const senderProfile = await StudentProfile.findOne({
            userId: req.user._id,
            isProfileComplete: true,
        });

        if (!senderProfile) {
            return res.status(400).json({
                success: false,
                message: "Please complete your profile before sending requests",
            });
        }

        // Check for SIMILAR_GOAL restriction
        if (receiverProfile.settings.allowRequests === "SIMILAR_GOAL") {
            if (senderProfile.primaryGoal !== receiverProfile.primaryGoal) {
                return res.status(403).json({
                    success: false,
                    message: "This user only accepts requests from students with the same goal",
                });
            }
        }

        // Check if sender hasn't reached max active partners
        if (!senderProfile.canAcceptPartners) {
            return res.status(400).json({
                success: false,
                message: `You have reached your maximum partner limit (${senderProfile.settings.maxPartners})`,
            });
        }

        // Check if blocked
        const isBlocked = await Connection.isBlocked(req.user._id, userId);
        if (isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Cannot send request to this user",
            });
        }

        // Calculate match score
        const { score, reasons } = await getMatchScoreBetween(req.user._id, userId);

        // Create connection request
        const connection = await Connection.create({
            requesterId: req.user._id,
            receiverId: userId,
            status: "PENDING",
            matchScore: score,
            matchReasons: reasons,
            requestMessage: message,
        });

        res.status(201).json({
            success: true,
            message: "Connection request sent successfully",
            data: connection,
        });
    } catch (error) {
        console.error("Send request error:", error);

        if (error.code === "DUPLICATE_CONNECTION") {
            return res.status(400).json({
                success: false,
                message: "A connection already exists with this user",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to send connection request",
        });
    }
};

/**
 * Get pending requests (received)
 */
export const getPendingRequests = async (req, res) => {
    try {
        const requests = await Connection.getPendingRequests(req.user._id);

        // Get requester profiles for additional info
        const requestsWithProfiles = await Promise.all(
            requests.map(async (request) => {
                const profile = await StudentProfile.findOne({
                    userId: request.requesterId._id,
                }).select("primaryGoal studyLevel bio currentFocus");

                return {
                    _id: request._id,
                    requester: {
                        userId: request.requesterId._id,
                        name: request.requesterId.name,
                        email: request.requesterId.email,
                        ...profile?.toObject(),
                    },
                    matchScore: request.matchScore,
                    matchReasons: request.matchReasons,
                    requestMessage: request.requestMessage,
                    createdAt: request.createdAt,
                };
            })
        );

        res.json({
            success: true,
            data: requestsWithProfiles,
        });
    } catch (error) {
        console.error("Get pending requests error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch pending requests",
        });
    }
};

/**
 * Get sent requests
 */
export const getSentRequests = async (req, res) => {
    try {
        const requests = await Connection.getSentRequests(req.user._id);

        const requestsWithProfiles = await Promise.all(
            requests.map(async (request) => {
                const profile = await StudentProfile.findOne({
                    userId: request.receiverId._id,
                }).select("primaryGoal studyLevel");

                return {
                    _id: request._id,
                    receiver: {
                        userId: request.receiverId._id,
                        name: request.receiverId.name,
                        ...profile?.toObject(),
                    },
                    matchScore: request.matchScore,
                    status: request.status,
                    createdAt: request.createdAt,
                };
            })
        );

        res.json({
            success: true,
            data: requestsWithProfiles,
        });
    } catch (error) {
        console.error("Get sent requests error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch sent requests",
        });
    }
};

/**
 * Accept a connection request
 */
export const acceptRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const connection = await Connection.findOne({
            _id: requestId,
            receiverId: req.user._id,
            status: "PENDING",
        });

        if (!connection) {
            return res.status(404).json({
                success: false,
                message: "Request not found or already processed",
            });
        }

        // Check if receiver can accept more partners
        const receiverProfile = await StudentProfile.findOne({ userId: req.user._id });
        if (!receiverProfile.canAcceptPartners) {
            return res.status(400).json({
                success: false,
                message: `You have reached your maximum partner limit (${receiverProfile.settings.maxPartners})`,
            });
        }

        await connection.accept();

        // Create system message for the new connection
        await Message.createSystemMessage(
            connection._id,
            "🎉 You are now connected! Start your study journey together."
        );

        res.json({
            success: true,
            message: "Connection accepted successfully",
            data: connection,
        });
    } catch (error) {
        console.error("Accept request error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to accept request",
        });
    }
};

/**
 * Reject a connection request
 */
export const rejectRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const connection = await Connection.findOne({
            _id: requestId,
            receiverId: req.user._id,
            status: "PENDING",
        });

        if (!connection) {
            return res.status(404).json({
                success: false,
                message: "Request not found or already processed",
            });
        }

        await connection.reject();

        res.json({
            success: true,
            message: "Connection request rejected",
        });
    } catch (error) {
        console.error("Reject request error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reject request",
        });
    }
};

/**
 * Get connected partners
 */
export const getPartners = async (req, res) => {
    try {
        const connections = await Connection.getPartners(req.user._id);

        const partners = await Promise.all(
            connections.map(async (conn) => {
                // Determine which user is the partner
                const partnerId =
                    conn.requesterId._id.toString() === req.user._id.toString()
                        ? conn.receiverId._id
                        : conn.requesterId._id;

                const partnerUser =
                    conn.requesterId._id.toString() === req.user._id.toString()
                        ? conn.receiverId
                        : conn.requesterId;

                const profile = await StudentProfile.findOne({ userId: partnerId });

                return {
                    connectionId: conn._id,
                    partnerId,
                    name: partnerUser.name,
                    email: partnerUser.email,
                    primaryGoal: profile?.primaryGoal,
                    studyLevel: profile?.studyLevel,
                    currentFocus: profile?.currentFocus,
                    progressStats: profile?.settings?.showProgress ? profile.progressStats : null,
                    matchScore: conn.matchScore,
                    connectedAt: conn.connectedAt,
                    lastInteraction: conn.lastInteraction,
                    messageCount: conn.messageCount,
                };
            })
        );

        res.json({
            success: true,
            data: partners,
        });
    } catch (error) {
        console.error("Get partners error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch partners",
        });
    }
};

/**
 * Remove/Unmatch a partner
 */
export const removePartner = async (req, res) => {
    try {
        const { userId } = req.params;

        const connection = await Connection.findOne({
            $or: [
                { requesterId: req.user._id, receiverId: userId },
                { requesterId: userId, receiverId: req.user._id },
            ],
            status: "ACCEPTED",
        });

        if (!connection) {
            return res.status(404).json({
                success: false,
                message: "Connection not found",
            });
        }

        // Decrement partner count for both users
        await StudentProfile.updateOne(
            { userId: connection.requesterId },
            { $inc: { activePartnersCount: -1 } }
        );
        await StudentProfile.updateOne(
            { userId: connection.receiverId },
            { $inc: { activePartnersCount: -1 } }
        );

        // Delete the connection
        await Connection.findByIdAndDelete(connection._id);

        res.json({
            success: true,
            message: "Partner removed successfully",
        });
    } catch (error) {
        console.error("Remove partner error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to remove partner",
        });
    }
};

/**
 * Block a user
 */
export const blockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        // Find existing connection
        let connection = await Connection.findOne({
            $or: [
                { requesterId: req.user._id, receiverId: userId },
                { requesterId: userId, receiverId: req.user._id },
            ],
        });

        if (connection) {
            await connection.block(reason);
        } else {
            // Create new blocked connection
            connection = await Connection.create({
                requesterId: req.user._id,
                receiverId: userId,
                status: "BLOCKED",
                actionReason: reason,
            });
        }

        res.json({
            success: true,
            message: "User blocked successfully",
        });
    } catch (error) {
        console.error("Block user error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to block user",
        });
    }
};

/**
 * Complete onboarding for a connection
 */
export const completeOnboarding = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const { primaryGoal, studyFrequency, communicationExpectations } = req.body;

        const connection = await Connection.findOne({
            _id: connectionId,
            status: "ACCEPTED",
            $or: [{ requesterId: req.user._id }, { receiverId: req.user._id }],
        });

        if (!connection) {
            return res.status(404).json({
                success: false,
                message: "Connection not found",
            });
        }

        await connection.completeOnboarding(req.user._id, {
            primaryGoal,
            studyFrequency,
            communicationExpectations,
        });

        res.json({
            success: true,
            message: "Onboarding preferences saved",
            data: {
                isComplete: connection.onboarding.isComplete,
                yourComplete: connection.requesterId.toString() === req.user._id.toString()
                    ? connection.onboarding.requesterComplete
                    : connection.onboarding.receiverComplete,
                partnerComplete: connection.requesterId.toString() === req.user._id.toString()
                    ? connection.onboarding.receiverComplete
                    : connection.onboarding.requesterComplete,
            },
        });
    } catch (error) {
        console.error("Complete onboarding error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to complete onboarding",
        });
    }
};

/**
 * Unmatch a partner (graceful disconnection)
 */
export const unmatchPartner = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const { reason, preserveProgress = true } = req.body;

        const connection = await Connection.findOne({
            _id: connectionId,
            status: "ACCEPTED",
            $or: [{ requesterId: req.user._id }, { receiverId: req.user._id }],
        });

        if (!connection) {
            return res.status(404).json({
                success: false,
                message: "Connection not found",
            });
        }

        await connection.unmatch(req.user._id, reason, preserveProgress);

        // Create system message
        await Message.createSystemMessage(
            connectionId,
            "This study partnership has ended. Progress has been preserved."
        );

        res.json({
            success: true,
            message: "Partnership ended successfully",
            data: {
                unmatchedAt: connection.unmatchedAt,
                progressPreserved: connection.progressPreserved,
            },
        });
    } catch (error) {
        console.error("Unmatch partner error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to unmatch partner",
        });
    }
};

/**
 * Get suggested rematches after unmatching
 */
export const getSuggestedRematches = async (req, res) => {
    try {
        // Get user's profile to find similar users
        const profile = await StudentProfile.findOne({ userId: req.user._id });

        if (!profile) {
            return res.status(400).json({
                success: false,
                message: "Please complete your profile first",
            });
        }

        // Get past unmatched connections to exclude
        const pastConnections = await Connection.find({
            $or: [{ requesterId: req.user._id }, { receiverId: req.user._id }],
        });

        const excludeIds = pastConnections.map((c) =>
            c.requesterId.toString() === req.user._id.toString()
                ? c.receiverId
                : c.requesterId
        );

        // Find potential matches excluding past connections
        const matches = await StudentProfile.find({
            userId: { $ne: req.user._id, $nin: excludeIds },
            primaryGoal: profile.primaryGoal,
            isProfileComplete: true,
            "settings.allowRequests": { $ne: "NONE" },
        })
            .populate("userId", "name email")
            .limit(10);

        const suggestions = matches.map((match) => ({
            userId: match.userId._id,
            name: match.userId.name,
            primaryGoal: match.primaryGoal,
            studyLevel: match.studyLevel,
            currentFocus: match.currentFocus,
        }));

        res.json({
            success: true,
            data: suggestions,
        });
    } catch (error) {
        console.error("Get suggested rematches error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get rematch suggestions",
        });
    }
};

export default {
    sendRequest,
    getPendingRequests,
    getSentRequests,
    acceptRequest,
    rejectRequest,
    getPartners,
    removePartner,
    blockUser,
    completeOnboarding,
    unmatchPartner,
    getSuggestedRematches,
};
