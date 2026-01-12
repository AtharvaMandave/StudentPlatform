import StudyPlan from "../models/studyPlan.model.js";
import Connection from "../models/connection.model.js";
import Milestone from "../models/milestone.model.js";

/**
 * Get study plan for a connection
 * @route GET /api/connect/plan/:connectionId
 */
export const getStudyPlan = async (req, res) => {
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

        const plan = await StudyPlan.getByConnection(connectionId);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: "No study plan found for this connection",
                data: null,
            });
        }

        // Determine which student the current user is
        const isStudentA = plan.studentA._id.toString() === req.user._id.toString();

        res.json({
            success: true,
            data: {
                plan,
                currentUserRole: isStudentA ? "studentA" : "studentB",
                progress: plan.checklistProgress,
            },
        });
    } catch (error) {
        console.error("Get study plan error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch study plan",
        });
    }
};

/**
 * Create study plan for a connection
 * @route POST /api/connect/plan/:connectionId
 */
export const createStudyPlan = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const {
            sharedGoal,
            customGoal,
            shortTermTarget,
            longTermTarget,
            preferences,
            weeklySchedule,
            checklist,
        } = req.body;

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

        // Check if plan already exists
        const existingPlan = await StudyPlan.findOne({ connectionId, isActive: true });
        if (existingPlan) {
            return res.status(409).json({
                success: false,
                message: "A study plan already exists for this connection",
            });
        }

        // Validate required fields
        if (!sharedGoal) {
            return res.status(400).json({
                success: false,
                message: "Shared goal is required",
            });
        }

        // Create the plan
        const plan = await StudyPlan.createFromConnection(connectionId, req.user._id, {
            sharedGoal,
            customGoal,
            shortTermTarget,
            longTermTarget,
            preferences,
            weeklySchedule: weeklySchedule || [],
            checklist: checklist || [],
        });

        // Update connection with study plan reference
        connection.studyPlanId = plan._id;
        await connection.save();

        // Award milestone
        await Milestone.awardMilestone(req.user._id, "PLAN_CREATED", connectionId);

        // Populate and return
        const populatedPlan = await StudyPlan.getByConnection(connectionId);

        res.status(201).json({
            success: true,
            message: "Study plan created successfully",
            data: populatedPlan,
        });
    } catch (error) {
        console.error("Create study plan error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create study plan",
        });
    }
};

/**
 * Update study plan
 * @route PUT /api/connect/plan/:connectionId
 */
export const updateStudyPlan = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const updates = req.body;

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

        const plan = await StudyPlan.findOne({ connectionId, isActive: true });

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: "Study plan not found",
            });
        }

        // Update allowed fields
        const allowedUpdates = [
            "sharedGoal",
            "customGoal",
            "shortTermTarget",
            "longTermTarget",
            "preferences",
            "weeklySchedule",
        ];

        allowedUpdates.forEach((field) => {
            if (updates[field] !== undefined) {
                plan[field] = updates[field];
            }
        });

        plan.lastUpdatedBy = req.user._id;
        plan.version += 1;
        await plan.save();

        const populatedPlan = await StudyPlan.getByConnection(connectionId);

        res.json({
            success: true,
            message: "Study plan updated successfully",
            data: populatedPlan,
        });
    } catch (error) {
        console.error("Update study plan error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update study plan",
        });
    }
};

/**
 * Add checklist item
 * @route POST /api/connect/plan/:connectionId/checklist
 */
export const addChecklistItem = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const { topic, description, dueDate } = req.body;

        if (!topic) {
            return res.status(400).json({
                success: false,
                message: "Topic is required",
            });
        }

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

        const plan = await StudyPlan.findOne({ connectionId, isActive: true });

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: "Study plan not found",
            });
        }

        const item = await plan.addChecklistItem(
            { topic, description, dueDate },
            req.user._id
        );

        res.status(201).json({
            success: true,
            message: "Checklist item added",
            data: item,
        });
    } catch (error) {
        console.error("Add checklist item error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add checklist item",
        });
    }
};

/**
 * Update checklist item status
 * @route PUT /api/connect/plan/:connectionId/checklist/:itemId
 */
export const updateChecklistItem = async (req, res) => {
    try {
        const { connectionId, itemId } = req.params;
        const { status, topic, description, dueDate } = req.body;

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

        const plan = await StudyPlan.findOne({ connectionId, isActive: true });

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: "Study plan not found",
            });
        }

        const item = plan.checklist.id(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Checklist item not found",
            });
        }

        // Update status if provided
        if (status) {
            await plan.updateChecklistStatus(itemId, req.user._id, status);

            // Check for milestone: First topic completed
            if (status === "COMPLETED") {
                const isStudentA = plan.studentA.toString() === req.user._id.toString();
                const completedCount = plan.checklist.filter((i) =>
                    isStudentA
                        ? i.studentAStatus === "COMPLETED"
                        : i.studentBStatus === "COMPLETED"
                ).length;

                if (completedCount === 1) {
                    await Milestone.awardMilestone(req.user._id, "FIRST_TOPIC", connectionId);
                }
                await Milestone.checkTopicMilestones(req.user._id, completedCount);

                // Check if both completed the same topic
                if (item.studentAStatus === "COMPLETED" && item.studentBStatus === "COMPLETED") {
                    await Milestone.awardMilestone(req.user._id, "TOPIC_TOGETHER", connectionId);
                }
            }
        }

        // Update other fields
        if (topic) item.topic = topic;
        if (description !== undefined) item.description = description;
        if (dueDate !== undefined) item.dueDate = dueDate;

        plan.lastUpdatedBy = req.user._id;
        await plan.save();

        res.json({
            success: true,
            message: "Checklist item updated",
            data: item,
        });
    } catch (error) {
        console.error("Update checklist item error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update checklist item",
        });
    }
};

/**
 * Remove checklist item
 * @route DELETE /api/connect/plan/:connectionId/checklist/:itemId
 */
export const removeChecklistItem = async (req, res) => {
    try {
        const { connectionId, itemId } = req.params;

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

        const plan = await StudyPlan.findOne({ connectionId, isActive: true });

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: "Study plan not found",
            });
        }

        await plan.removeChecklistItem(itemId, req.user._id);

        res.json({
            success: true,
            message: "Checklist item removed",
        });
    } catch (error) {
        console.error("Remove checklist item error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to remove checklist item",
        });
    }
};

/**
 * Update weekly schedule
 * @route PUT /api/connect/plan/:connectionId/schedule
 */
export const updateSchedule = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const { weeklySchedule } = req.body;

        if (!Array.isArray(weeklySchedule)) {
            return res.status(400).json({
                success: false,
                message: "Weekly schedule must be an array",
            });
        }

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

        const plan = await StudyPlan.findOne({ connectionId, isActive: true });

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: "Study plan not found",
            });
        }

        plan.weeklySchedule = weeklySchedule;
        plan.lastUpdatedBy = req.user._id;
        await plan.save();

        res.json({
            success: true,
            message: "Schedule updated successfully",
            data: plan.weeklySchedule,
        });
    } catch (error) {
        console.error("Update schedule error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update schedule",
        });
    }
};

export default {
    getStudyPlan,
    createStudyPlan,
    updateStudyPlan,
    addChecklistItem,
    updateChecklistItem,
    removeChecklistItem,
    updateSchedule,
};
