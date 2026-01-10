'use client';

import { useState } from 'react';
import { UserPlus, Eye, Target, BookOpen, Clock, MessageSquare, Flame } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const GOAL_LABELS = {
    DSA: { label: 'DSA', icon: '🧮' },
    WEB_DEV: { label: 'Web Dev', icon: '🌐' },
    HIGHER_STUDIES: { label: 'Higher Studies', icon: '🎓' },
    UPSC: { label: 'UPSC', icon: '🏛️' },
    GATE: { label: 'GATE', icon: '📚' },
    PLACEMENTS: { label: 'Placements', icon: '💼' },
    OTHER: { label: 'Other', icon: '🎯' },
};

const LEVEL_LABELS = {
    BEGINNER: 'Beginner',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced',
};

const AVAILABILITY_LABELS = {
    DAILY: 'Daily',
    WEEKENDS: 'Weekends',
    FLEXIBLE: 'Flexible',
};

export default function PartnerCard({ partner, onSendRequest, showActions = true }) {
    const [loading, setLoading] = useState(false);
    const [requestSent, setRequestSent] = useState(false);

    const goal = GOAL_LABELS[partner.primaryGoal] || { label: partner.primaryGoal, icon: '🎯' };

    const handleSendRequest = async () => {
        setLoading(true);
        try {
            await onSendRequest(partner.userId);
            setRequestSent(true);
        } catch (error) {
            // Error handled in parent
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card-white p-5 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                    {partner.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{partner.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                        <span>{goal.icon}</span>
                        <span>{goal.label}</span>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="w-4 h-4 text-violet-500" />
                    <span>{LEVEL_LABELS[partner.studyLevel] || partner.studyLevel}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-violet-500" />
                    <span>
                        {AVAILABILITY_LABELS[partner.availability?.type] || 'Flexible'}
                        {partner.availability?.hoursPerDay && ` • ${partner.availability.hoursPerDay}hrs/day`}
                    </span>
                </div>
                {partner.currentFocus && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Target className="w-4 h-4 text-violet-500" />
                        <span className="truncate">{partner.currentFocus}</span>
                    </div>
                )}
                {partner.progressStats?.currentStreak > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span>{partner.progressStats.currentStreak} day streak</span>
                    </div>
                )}
            </div>

            {/* Match Score */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Match Score</span>
                    <span className={cn(
                        "text-sm font-semibold",
                        partner.matchScore >= 80 ? "text-emerald-600" :
                            partner.matchScore >= 60 ? "text-violet-600" :
                                "text-amber-600"
                    )}>
                        {partner.matchScore}%
                    </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all",
                            partner.matchScore >= 80 ? "bg-emerald-500" :
                                partner.matchScore >= 60 ? "bg-violet-500" :
                                    "bg-amber-500"
                        )}
                        style={{ width: `${partner.matchScore}%` }}
                    />
                </div>
                {partner.matchReasons?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {partner.matchReasons.slice(0, 2).map((reason, i) => (
                            <span
                                key={i}
                                className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600"
                            >
                                ✓ {reason.replace(/^Same goal: |^Same level: |^Same availability: |^Same study mode: /, '')}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Bio */}
            {partner.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{partner.bio}</p>
            )}

            {/* Actions */}
            {showActions && (
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => {/* View profile modal */ }}
                    >
                        <Eye className="w-4 h-4" />
                        View
                    </Button>
                    <Button
                        size="sm"
                        className="flex-1"
                        onClick={handleSendRequest}
                        loading={loading}
                        disabled={requestSent}
                    >
                        {requestSent ? (
                            'Sent'
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4" />
                                Connect
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
