'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    CreditCard,
    ClipboardList,
    Bell,
    Calendar,
    ArrowRight,
    BookOpen,
    Clock
} from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import StudentProfileCard from '@/components/dashboard/StudentProfileCard';
import StatisticsChart from '@/components/dashboard/StatisticsChart';
import { authAPI } from '@/lib/api';

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await authAPI.getCurrentUser();
                if (response?.data?.user) {
                    setUser(response.data.user);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 font-sans">
            {/* Left Main Content - 3 Columns */}
            <div className="xl:col-span-3 space-y-8">

                {/* Stats Row */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white tracking-tight">Overview</h2>
                        <span className="text-xs text-zinc-500 font-mono">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href="/courses">
                            <StatsCard
                                title="Enrolled Courses"
                                value="4"
                                icon="cap"
                            />
                        </Link>
                        <Link href="/payment">
                            <StatsCard
                                title="Payment Due"
                                value="$150"
                                icon="target"
                            />
                        </Link>
                        <Link href="/schedule">
                            <StatsCard
                                title="Upcoming Exams"
                                value="2"
                                icon="timer"
                            />
                        </Link>
                    </div>
                </div>

                {/* Banner */}
                <div className="relative overflow-hidden rounded-xl p-8 border border-white/10 bg-[#121217]">
                    <div className="relative z-10 flex flex-col justify-center h-full">
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Welcome back, {user?.name?.split(' ')[0] || 'User'}.
                        </h1>
                        <p className="text-gray-400 max-w-lg mb-6 text-sm leading-relaxed">
                            You have 2 upcoming exams and 1 payment pending. Stay on track!
                        </p>
                        <div className="flex gap-3">
                            <button className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                                View Schedule
                            </button>
                            <button className="px-4 py-2 border border-white/10 text-white text-xs font-semibold rounded-lg hover:bg-white/5 transition-colors">
                                Pay Fees
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Access Grid */}
                <div>
                    <h2 className="text-lg font-bold text-white mb-6 tracking-tight">Quick Access</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/payment" className="p-6 rounded-xl bg-[#121217] border border-white/10 hover:border-white/20 transition-all group cursor-pointer block">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="p-2 rounded-lg bg-white/5 text-white">
                                    <CreditCard size={20} />
                                </div>
                                <h3 className="text-sm font-semibold text-white">Payment Info</h3>
                            </div>
                            <p className="text-xs text-gray-500">View your fee status and payment history.</p>
                        </Link>

                        <Link href="/registration" className="p-6 rounded-xl bg-[#121217] border border-white/10 hover:border-white/20 transition-all group cursor-pointer block">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="p-2 rounded-lg bg-white/5 text-white">
                                    <ClipboardList size={20} />
                                </div>
                                <h3 className="text-sm font-semibold text-white">Registration</h3>
                            </div>
                            <p className="text-xs text-gray-500">Course registration and semester enrollment.</p>
                        </Link>
                    </div>
                </div>

                {/* Important Notices */}
                <div className="bg-[#121217] p-6 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white tracking-tight">Notices</h2>
                        <Link href="/notices" className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
                            View all <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-start gap-4 p-4 rounded-lg border border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="p-1.5 rounded bg-white/10 text-white flex-shrink-0">
                                <Bell size={14} />
                            </div>
                            <div>
                                <h4 className="text-white text-sm font-medium mb-0.5">Prelim payment due</h4>
                                <p className="text-xs text-gray-500">Please settle your preliminary examination fees before Oct 25th.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-lg border border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="p-1.5 rounded bg-white/10 text-white flex-shrink-0">
                                <Calendar size={14} />
                            </div>
                            <div>
                                <h4 className="text-white text-sm font-medium mb-0.5">Exam Schedule Released</h4>
                                <p className="text-xs text-gray-500">Final examination schedule for Fall semester is now available.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar - 1 Column */}
            <div className="xl:col-span-1 space-y-6">
                <div className="flex justify-between items-center mb-1">
                    <h2 className="text-lg font-bold text-white tracking-tight">Profile</h2>
                </div>
                <StudentProfileCard user={user} />
                <StatisticsChart />
            </div>
        </div>
    );
}
