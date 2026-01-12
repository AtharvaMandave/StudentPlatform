'use client';

import { useState, useEffect } from 'react';
import {
    Trophy, Medal, Star, Crown, Gem,
    Loader2, TrendingUp, Zap, Award
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { Card, StatCard } from '@/components/ui/GlassCard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ConnectNav from '@/components/connect/ConnectNav';
import { connectAPI } from '@/lib/connectApi';
import { cn } from '@/lib/utils';

const TIER_CONFIG = {
    BRONZE: {
        icon: Medal,
        color: 'text-amber-700 dark:text-amber-500',
        bg: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/20'
    },
    SILVER: {
        icon: Medal,
        color: 'text-gray-600 dark:text-gray-400',
        bg: 'bg-gray-50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-800'
    },
    GOLD: {
        icon: Star,
        color: 'text-yellow-600 dark:text-yellow-500',
        bg: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/20'
    },
    PLATINUM: {
        icon: Crown,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/20'
    },
    DIAMOND: {
        icon: Gem,
        color: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-900/20'
    },
};

const TIER_ORDER = ['DIAMOND', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE'];

export default function MilestonesPage() {
    const [loading, setLoading] = useState(true);
    const [milestones, setMilestones] = useState([]);
    const [totalPoints, setTotalPoints] = useState(0);
    const [byTier, setByTier] = useState({});
    const [leaderboard, setLeaderboard] = useState([]);
    const [currentUserRank, setCurrentUserRank] = useState(null);
    const [activeTab, setActiveTab] = useState('badges');
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const milestonesRes = await connectAPI.getMilestones();
            const data = milestonesRes?.data || milestonesRes;

            setMilestones(data?.milestones || []);
            setTotalPoints(data?.totalPoints || 0);
            setByTier(data?.byTier || {});

            const leaderboardRes = await connectAPI.getLeaderboard();
            const lbData = leaderboardRes?.data || leaderboardRes;

            setLeaderboard(lbData?.leaderboard || []);
            setCurrentUserRank(lbData?.currentUser || null);
        } catch (error) {
            setAlert({ type: 'error', message: 'Failed to load achievements' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading achievements...</div>;
    }

    const totalBadges = milestones.length;

    return (
        <DashboardLayout>
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="max-w-5xl mx-auto px-4 py-8">
                <ConnectNav />

                {/* Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="p-6 md:col-span-2">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-[#27272A] rounded-xl flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-gray-900 dark:text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Achievements</h1>
                                <p className="text-sm text-gray-500">Track your progress</p>
                            </div>
                        </div>
                    </Card>

                    <StatCard label="Total Points" value={totalPoints} icon={Zap} />
                    <StatCard label="Badges Earned" value={totalBadges} icon={Award} />
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-[#27272A] mb-8">
                    <button
                        onClick={() => setActiveTab('badges')}
                        className={cn(
                            "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                            activeTab === 'badges'
                                ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                        )}
                    >
                        My Badges
                    </button>
                    <button
                        onClick={() => setActiveTab('leaderboard')}
                        className={cn(
                            "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                            activeTab === 'leaderboard'
                                ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                        )}
                    >
                        Leaderboard
                    </button>
                </div>

                {/* Badges Tab */}
                {activeTab === 'badges' && (
                    <div className="space-y-8">
                        {milestones.length === 0 ? (
                            <EmptyState
                                icon={Trophy}
                                title="No badges yet"
                                description="Complete check-ins and maintain streaks to earn badges."
                                action={() => window.location.href = '/connect'}
                                actionLabel="Start Journey"
                            />
                        ) : (
                            TIER_ORDER.map((tier) => {
                                const tierMilestones = byTier[tier] || [];
                                if (tierMilestones.length === 0) return null;

                                const TierIcon = TIER_CONFIG[tier]?.icon || Medal;
                                const tierConfig = TIER_CONFIG[tier];

                                return (
                                    <section key={tier}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <h2 className={cn('text-sm font-semibold tracking-wider flex items-center gap-2', tierConfig.color)}>
                                                <TierIcon className="w-4 h-4" />
                                                {tier}
                                            </h2>
                                            <span className="text-xs text-gray-400">({tierMilestones.length})</span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {tierMilestones.map((milestone) => (
                                                <div
                                                    key={milestone._id}
                                                    className={cn(
                                                        'p-4 rounded-xl border text-center transition-all',
                                                        tierConfig.bg
                                                    )}
                                                >
                                                    <div className="text-3xl mb-3">{milestone.badge?.icon || '🏆'}</div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white text-xs mb-1">
                                                        {milestone.badge?.name}
                                                    </h4>
                                                    <p className={cn('text-[10px] font-medium', tierConfig.color)}>
                                                        +{milestone.points} pts
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 mt-2">
                                                        {new Date(milestone.earnedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Leaderboard Tab */}
                {activeTab === 'leaderboard' && (
                    <Card className="overflow-hidden">
                        <div className="p-4 border-b border-gray-100 dark:border-[#27272A] bg-gray-50/50 dark:bg-[#18181B]/50">
                            <h3 className="font-medium text-gray-900 dark:text-white">Top Achievers</h3>
                        </div>

                        {leaderboard.length === 0 ? (
                            <EmptyState title="No rankings available" description="Be the first to join the leaderboard!" />
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-[#27272A]">
                                {leaderboard.map((user, index) => (
                                    <div
                                        key={user.userId}
                                        className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-[#18181B] transition-colors"
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                                            index === 0 ? "bg-yellow-100 text-yellow-700" :
                                                index === 1 ? "bg-gray-100 text-gray-700" :
                                                    index === 2 ? "bg-amber-100 text-amber-700" :
                                                        "text-gray-500"
                                        )}>
                                            {index + 1}
                                        </div>

                                        <Avatar name={user.name} size="sm" />

                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.badgeCount} badges</p>
                                        </div>

                                        <div className="text-right">
                                            <p className="font-semibold text-sm text-gray-900 dark:text-white">{user.totalPoints}</p>
                                            <p className="text-xs text-gray-500">pts</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
