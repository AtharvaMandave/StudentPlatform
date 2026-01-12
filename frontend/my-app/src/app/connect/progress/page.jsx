'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Activity, TrendingUp, Zap, Target, Calendar,
    BarChart3, CheckCircle2, Clock, Flame, Trophy, Users
} from 'lucide-react';
import { Card, StatCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ConnectNav from '@/components/connect/ConnectNav';
import { connectAPI } from '@/lib/connectApi';
import { cn } from '@/lib/utils';

export default function ProgressPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [partners, setPartners] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [comparisonData, setComparisonData] = useState(null);
    const [viewMode, setViewMode] = useState('individual'); // 'individual' or 'comparison'

    useEffect(() => {
        fetchPartners();
    }, []);

    useEffect(() => {
        if (selectedPartner) {
            fetchComparison();
        }
    }, [selectedPartner]);

    const fetchPartners = async () => {
        try {
            const response = await connectAPI.getPartners();
            const data = response?.data || response || [];
            setPartners(data);
            if (data.length > 0) {
                setSelectedPartner(data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch partners:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchComparison = async () => {
        if (!selectedPartner?.connectionId) return;

        setLoading(true);
        try {
            const response = await connectAPI.getPartnerComparison(selectedPartner.connectionId);
            const data = response?.data || response;
            setComparisonData(data);
            setViewMode('comparison');
        } catch (error) {
            console.error('Failed to fetch comparison:', error);
            setViewMode('individual');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !comparisonData) {
        return (
            <DashboardLayout>
                <div className="p-8 text-center text-gray-500">Loading progress...</div>
            </DashboardLayout>
        );
    }

    // Prepare dual chart data
    const prepareDualChartData = () => {
        if (!comparisonData) return [];

        const myHistory = comparisonData.myStats?.history || [];
        const partnerHistory = comparisonData.partnerStats?.history || [];

        // Create a map of weeks
        const weeksMap = new Map();

        myHistory.forEach(item => {
            const week = `Week ${item.weekNumber}`;
            weeksMap.set(week, {
                week,
                myHours: item.totalHoursStudied || 0,
                partnerHours: 0,
                label: new Date(item.weekOf).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            });
        });

        partnerHistory.forEach(item => {
            const week = `Week ${item.weekNumber}`;
            const existing = weeksMap.get(week);
            if (existing) {
                existing.partnerHours = item.totalHoursStudied || 0;
            } else {
                weeksMap.set(week, {
                    week,
                    myHours: 0,
                    partnerHours: item.totalHoursStudied || 0,
                    label: new Date(item.weekOf).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                });
            }
        });

        return Array.from(weeksMap.values()).reverse().slice(0, 12);
    };

    const chartData = prepareDualChartData();
    const maxHours = Math.max(...chartData.flatMap(d => [d.myHours, d.partnerHours]), 10);

    const myStats = comparisonData?.myStats || {};
    const partnerStats = comparisonData?.partnerStats || {};
    const partnerInfo = comparisonData?.partnerInfo || {};

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <ConnectNav />

                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Progress Tracker</h1>
                            <p className="text-gray-500">Track and compare your study progress</p>
                        </div>

                        {partners.length > 0 && (
                            <div className="flex items-center gap-3">
                                <select
                                    value={selectedPartner?.connectionId || ''}
                                    onChange={(e) => {
                                        const partner = partners.find(p => p.connectionId === e.target.value);
                                        setSelectedPartner(partner);
                                    }}
                                    className="px-4 py-2 bg-white dark:bg-[#121217] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-400 dark:focus:border-white/30"
                                >
                                    {partners.map(partner => (
                                        <option key={partner.connectionId} value={partner.connectionId}>
                                            Compare with {partner.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {viewMode === 'comparison' && comparisonData ? (
                    <>
                        {/* Comparison Header */}
                        <div className="mb-6 p-4 bg-white dark:bg-[#121217] border border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-gray-500" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    You vs {partnerInfo.name}
                                </span>
                            </div>
                            {myStats.streakWeeks > partnerStats.streakWeeks ? (
                                <Badge variant="success" className="flex items-center gap-1">
                                    <Trophy className="w-3 h-3" />
                                    You're Leading!
                                </Badge>
                            ) : myStats.streakWeeks < partnerStats.streakWeeks ? (
                                <Badge variant="default" className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    Catch Up!
                                </Badge>
                            ) : (
                                <Badge variant="default">Tied!</Badge>
                            )}
                        </div>

                        {/* Side-by-Side Stats */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Your Stats */}
                            <Card className="p-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Your Stats</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Flame className="w-4 h-4 text-orange-500" />
                                            <span className="text-xs text-gray-500">Streak</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {myStats.streakWeeks || 0}
                                        </p>
                                        <p className="text-xs text-gray-500">weeks</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="w-4 h-4 text-blue-500" />
                                            <span className="text-xs text-gray-500">Avg Hours</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {myStats.averageHours || 0}
                                        </p>
                                        <p className="text-xs text-gray-500">per week</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Target className="w-4 h-4 text-green-500" />
                                            <span className="text-xs text-gray-500">Goals Met</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {myStats.goalsMetPercentage || 0}%
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle2 className="w-4 h-4 text-purple-500" />
                                            <span className="text-xs text-gray-500">Check-ins</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {myStats.totalCheckIns || 0}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Partner Stats */}
                            <Card className="p-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{partnerInfo.name}'s Stats</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Flame className="w-4 h-4 text-orange-500" />
                                            <span className="text-xs text-gray-500">Streak</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {partnerStats.streakWeeks || 0}
                                        </p>
                                        <p className="text-xs text-gray-500">weeks</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="w-4 h-4 text-blue-500" />
                                            <span className="text-xs text-gray-500">Avg Hours</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {partnerStats.averageHours || 0}
                                        </p>
                                        <p className="text-xs text-gray-500">per week</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Target className="w-4 h-4 text-green-500" />
                                            <span className="text-xs text-gray-500">Goals Met</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {partnerStats.goalsMetPercentage || 0}%
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle2 className="w-4 h-4 text-purple-500" />
                                            <span className="text-xs text-gray-500">Check-ins</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {partnerStats.totalCheckIns || 0}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Dual-Line Chart */}
                        <Card className="p-6 mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-gray-500" />
                                    Study Hours Comparison
                                </h3>
                                <div className="flex items-center gap-4 text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-white"></div>
                                        <span className="text-gray-500">You</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                                        <span className="text-gray-500">{partnerInfo.name}</span>
                                    </div>
                                </div>
                            </div>

                            {chartData.length > 0 ? (
                                <div className="h-64 flex items-end gap-2 sm:gap-4">
                                    {chartData.map((d, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                            <div className="relative w-full flex justify-end flex-col h-full bg-gray-100 dark:bg-[#18181B] rounded-t-lg overflow-hidden">
                                                {/* Partner's bar (background) */}
                                                <div
                                                    className="absolute bottom-0 w-full bg-gray-400 dark:bg-gray-600 transition-all duration-500"
                                                    style={{ height: `${(d.partnerHours / maxHours) * 100}%` }}
                                                />
                                                {/* Your bar (foreground) */}
                                                <div
                                                    className="relative w-full bg-white dark:bg-white transition-all duration-500 ease-out group-hover:opacity-90"
                                                    style={{ height: `${(d.myHours / maxHours) * 100}%` }}
                                                />
                                                {/* Tooltip */}
                                                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-2 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    <div>You: {d.myHours}h</div>
                                                    <div>{partnerInfo.name}: {d.partnerHours}h</div>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-gray-400 truncate w-full text-center">
                                                {d.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    title="No activity yet"
                                    description="Complete weekly check-ins to see comparison."
                                    className="h-64 items-center justify-center"
                                />
                            )}
                        </Card>
                    </>
                ) : (
                    <EmptyState
                        title="No partners yet"
                        description="Connect with a study partner to see progress comparison."
                        action={() => router.push('/connect')}
                        actionLabel="Find Partners"
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
