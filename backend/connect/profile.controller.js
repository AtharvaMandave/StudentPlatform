import StudentProfile from "../models/studentProfile.model.js";

/**
 * Get current user's student profile
 */
export const getProfile = async (req, res) => {
    try {
        const profile = await StudentProfile.findOne({ userId: req.user._id })
            .populate("userId", "name email");

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found. Please create your profile.",
            });
        }

        res.json({
            success: true,
            data: profile,
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
        });
    }
};

/**
 * Create or update student profile
 */
export const upsertProfile = async (req, res) => {
    try {
        const {
            primaryGoal,
            secondaryInterests,
            studyLevel,
            availability,
            preferredMode,
            bio,
            currentFocus,
            settings,
        } = req.body;

        // Validate required fields
        if (!primaryGoal || !studyLevel) {
            return res.status(400).json({
                success: false,
                message: "Primary goal and study level are required",
            });
        }

        const profileData = {
            userId: req.user._id,
            primaryGoal,
            studyLevel,
            isProfileComplete: true,
        };

        // Optional fields
        if (secondaryInterests) profileData.secondaryInterests = secondaryInterests;
        if (availability) profileData.availability = availability;
        if (preferredMode) profileData.preferredMode = preferredMode;
        if (bio) profileData.bio = bio;
        if (currentFocus) profileData.currentFocus = currentFocus;
        if (settings) profileData.settings = settings;

        const profile = await StudentProfile.findOneAndUpdate(
            { userId: req.user._id },
            profileData,
            { new: true, upsert: true, runValidators: true }
        ).populate("userId", "name email");

        res.json({
            success: true,
            message: profile.isNew ? "Profile created successfully" : "Profile updated successfully",
            data: profile,
        });
    } catch (error) {
        console.error("Upsert profile error:", error);

        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({
                success: false,
                message: messages.join(", "),
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to save profile",
        });
    }
};

/**
 * Get another user's profile (limited info for discovery)
 */
export const getPublicProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const profile = await StudentProfile.findOne({ userId, isProfileComplete: true })
            .populate("userId", "name")
            .select("-settings -__v");

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        // Check if requester's goal matches for "SIMILAR_GOAL" privacy
        if (profile.settings?.allowRequests === "SIMILAR_GOAL") {
            const requesterProfile = await StudentProfile.findOne({ userId: req.user._id });
            if (!requesterProfile || requesterProfile.primaryGoal !== profile.primaryGoal) {
                return res.status(403).json({
                    success: false,
                    message: "This user only accepts requests from students with similar goals",
                });
            }
        }

        res.json({
            success: true,
            data: profile,
        });
    } catch (error) {
        console.error("Get public profile error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
        });
    }
};

/**
 * Update progress stats
 */
export const updateProgress = async (req, res) => {
    try {
        const { topicsCompleted, completionPercentage, studyHours } = req.body;

        const profile = await StudentProfile.findOne({ userId: req.user._id });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        await profile.updateProgress({
            topicsCompleted,
            completionPercentage,
            studyHours,
        });

        res.json({
            success: true,
            message: "Progress updated successfully",
            data: profile.progressStats,
        });
    } catch (error) {
        console.error("Update progress error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update progress",
        });
    }
};

/**
 * Update privacy settings
 */
export const updateSettings = async (req, res) => {
    try {
        const { showProgress, allowRequests, maxPartners } = req.body;

        const updates = {};
        if (showProgress !== undefined) updates["settings.showProgress"] = showProgress;
        if (allowRequests) updates["settings.allowRequests"] = allowRequests;
        if (maxPartners) updates["settings.maxPartners"] = Math.min(5, Math.max(1, maxPartners));

        const profile = await StudentProfile.findOneAndUpdate(
            { userId: req.user._id },
            updates,
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        res.json({
            success: true,
            message: "Settings updated successfully",
            data: profile.settings,
        });
    } catch (error) {
        console.error("Update settings error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update settings",
        });
    }
};

export default {
    getProfile,
    upsertProfile,
    getPublicProfile,
    updateProgress,
    updateSettings,
};
