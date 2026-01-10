import StudentProfile from "../models/studentProfile.model.js";
import Connection from "../models/connection.model.js";

// Study level order for comparison
const LEVEL_ORDER = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

// Weight configuration for match scoring
const MATCH_WEIGHTS = {
    goalMatch: 40,       // Primary goal must match (mandatory)
    levelMatch: 25,      // Study level similarity
    availabilityMatch: 20, // Availability overlap
    modeMatch: 15,       // Preferred mode compatibility
};

/**
 * Calculate match score between two student profiles
 * @param {Object} profileA - First student profile
 * @param {Object} profileB - Second student profile
 * @returns {Object} { score: number, reasons: string[] }
 */
export function calculateMatchScore(profileA, profileB) {
    let score = 0;
    const reasons = [];

    // 1. Goal Match (Required - 40 points)
    if (profileA.primaryGoal !== profileB.primaryGoal) {
        return { score: 0, reasons: ["Goals do not match"] };
    }
    score += MATCH_WEIGHTS.goalMatch;
    reasons.push(`Same goal: ${formatGoal(profileA.primaryGoal)}`);

    // 2. Level Match (25 points max)
    const levelA = LEVEL_ORDER.indexOf(profileA.studyLevel);
    const levelB = LEVEL_ORDER.indexOf(profileB.studyLevel);
    const levelDiff = Math.abs(levelA - levelB);

    if (levelDiff === 0) {
        score += 25;
        reasons.push(`Same level: ${formatLevel(profileA.studyLevel)}`);
    } else if (levelDiff === 1) {
        score += 15;
        reasons.push("Similar study level");
    } else {
        score += 5;
    }

    // 3. Availability Match (20 points max)
    const availA = profileA.availability?.type || "FLEXIBLE";
    const availB = profileB.availability?.type || "FLEXIBLE";

    if (availA === availB) {
        score += 20;
        reasons.push(`Same availability: ${formatAvailability(availA)}`);
    } else if (availA === "FLEXIBLE" || availB === "FLEXIBLE") {
        score += 12;
        reasons.push("Flexible availability");
    } else {
        score += 5;
    }

    // 4. Mode Match (15 points max)
    const modeA = profileA.preferredMode || "BOTH";
    const modeB = profileB.preferredMode || "BOTH";

    if (modeA === modeB) {
        score += 15;
        reasons.push(`Same study mode: ${formatMode(modeA)}`);
    } else if (modeA === "BOTH" || modeB === "BOTH") {
        score += 10;
    } else {
        score += 3;
    }

    return { score, reasons };
}

/**
 * Find and rank potential study partners for a user
 * @param {string} userId - User's ID
 * @param {Object} filters - Optional filters
 * @param {Object} pagination - Page and limit
 * @returns {Array} Ranked list of potential partners with scores
 */
export async function findMatches(userId, filters = {}, pagination = { page: 1, limit: 20 }) {
    const userProfile = await StudentProfile.findOne({ userId });

    if (!userProfile) {
        throw new Error("Please complete your profile first");
    }

    if (!userProfile.isProfileComplete) {
        throw new Error("Please complete your profile to find study partners");
    }

    // Build query for potential matches
    const query = {
        userId: { $ne: userId },
        isProfileComplete: true,
        primaryGoal: userProfile.primaryGoal, // Must match goal
        "settings.allowRequests": { $ne: "NONE" },
    };

    // Apply filters
    if (filters.level && filters.level !== "ALL") {
        query.studyLevel = filters.level;
    }
    if (filters.availability && filters.availability !== "ALL") {
        query["availability.type"] = filters.availability;
    }
    if (filters.mode && filters.mode !== "ALL") {
        query.preferredMode = { $in: [filters.mode, "BOTH"] };
    }

    // Get candidates
    const candidates = await StudentProfile.find(query)
        .populate("userId", "name email")
        .lean();

    // Get existing connections to filter out
    const existingConnections = await Connection.find({
        $or: [{ requesterId: userId }, { receiverId: userId }],
    });

    const connectedUserIds = new Set();
    existingConnections.forEach((conn) => {
        connectedUserIds.add(conn.requesterId.toString());
        connectedUserIds.add(conn.receiverId.toString());
    });

    // Filter out already connected/requested users
    const availableCandidates = candidates.filter(
        (candidate) => !connectedUserIds.has(candidate.userId._id.toString())
    );

    // Calculate match scores
    const scoredMatches = availableCandidates.map((candidate) => {
        const { score, reasons } = calculateMatchScore(userProfile, candidate);
        return {
            profile: candidate,
            matchScore: score,
            matchReasons: reasons,
        };
    });

    // Sort by match score (highest first)
    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

    // Apply pagination
    const { page, limit } = pagination;
    const startIndex = (page - 1) * limit;
    const paginatedMatches = scoredMatches.slice(startIndex, startIndex + limit);

    return {
        matches: paginatedMatches,
        pagination: {
            page,
            limit,
            total: scoredMatches.length,
            pages: Math.ceil(scoredMatches.length / limit),
        },
    };
}

/**
 * Get match score between two specific users
 */
export async function getMatchScoreBetween(userId1, userId2) {
    const [profile1, profile2] = await Promise.all([
        StudentProfile.findOne({ userId: userId1 }),
        StudentProfile.findOne({ userId: userId2 }),
    ]);

    if (!profile1 || !profile2) {
        return { score: 0, reasons: ["Profile not found"] };
    }

    return calculateMatchScore(profile1, profile2);
}

// Helper functions for formatting
function formatGoal(goal) {
    const goals = {
        DSA: "DSA Preparation",
        WEB_DEV: "Web Development",
        HIGHER_STUDIES: "Higher Studies",
        UPSC: "UPSC Preparation",
        GATE: "GATE Exam",
        PLACEMENTS: "Campus Placements",
        OTHER: "Other",
    };
    return goals[goal] || goal;
}

function formatLevel(level) {
    const levels = {
        BEGINNER: "Beginner",
        INTERMEDIATE: "Intermediate",
        ADVANCED: "Advanced",
    };
    return levels[level] || level;
}

function formatAvailability(avail) {
    const options = {
        DAILY: "Daily",
        WEEKENDS: "Weekends",
        FLEXIBLE: "Flexible",
    };
    return options[avail] || avail;
}

function formatMode(mode) {
    const modes = {
        ONLINE: "Online",
        DISCUSSION: "Discussion-based",
        BOTH: "Any mode",
    };
    return modes[mode] || mode;
}

export default {
    calculateMatchScore,
    findMatches,
    getMatchScoreBetween,
};
