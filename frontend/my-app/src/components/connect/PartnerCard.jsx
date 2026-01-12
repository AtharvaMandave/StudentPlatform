'use client';

import { useState } from 'react';
import {
    Clock, Award, Briefcase, ChevronRight, Check
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

export default function PartnerCard({ partner, onSendRequest, showActions = true }) {
    const [loading, setLoading] = useState(false);
    const [requestSent, setRequestSent] = useState(false);

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
        <Card className="flex flex-col h-full" hover>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Avatar name={partner.name} size="md" />
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate max-w-[150px]">
                            {partner.name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">
                            {partner.studyLevel} • {partner.studyMode}
                        </p>
                    </div>
                </div>
                {partner.matchScore && (
                    <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        partner.matchScore >= 80
                            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-[#27272A] dark:text-gray-400"
                    )}>
                        {partner.matchScore}% Match
                    </span>
                )}
            </div>

            {/* Goal Tag */}
            <div className="mb-4">
                <Badge variant="default" className="bg-gray-100 text-gray-700 border border-gray-200">
                    <Briefcase className="w-3 h-3 mr-1.5 text-gray-500" />
                    {partner.primaryGoal}
                </Badge>
            </div>

            {/* Bio */}
            <div className="flex-1 mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                    {partner.bio || "No bio added."}
                </p>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-100 dark:border-[#27272A] pt-4 mb-4">
                <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{partner.availability?.hoursPerDay || 0}h/day</span>
                </div>
                {partner.progressStats?.currentStreak > 0 && (
                    <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" />
                        <span>{partner.progressStats.currentStreak} day streak</span>
                    </div>
                )}
            </div>

            {/* Actions */}
            {showActions && (
                <div className="mt-auto">
                    <Button
                        size="sm"
                        className={cn(
                            'w-full justify-center transition-all',
                            requestSent
                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200'
                        )}
                        onClick={handleSendRequest}
                        loading={loading}
                        disabled={requestSent}
                    >
                        {requestSent ? (
                            <>
                                <Check className="w-3.5 h-3.5 mr-2" />
                                Requested
                            </>
                        ) : (
                            <>
                                Connect
                                <ChevronRight className="w-3.5 h-3.5 ml-2 opacity-60" />
                            </>
                        )}
                    </Button>
                </div>
            )}
        </Card>
    );
}
