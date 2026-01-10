'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    CreditCard,
    ClipboardList,
    Bell,
    Calendar
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
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Left Main Content - 3 Columns */}
            <div className="xl:col-span-3 space-y-8">

                {/* Stats Row */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-6">Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link href="/courses">
                            <StatsCard
                                title="Enrolled Courses"
                                value="4"
                                icon="cap"
                                color="primary"
                            />
                        </Link>
                        <Link href="/payment">
                            <StatsCard
                                title="Payment Due"
                                value="$150"
                                icon="target"
                                color="purple"
                            />
                        </Link>
                        <Link href="/schedule">
                            <StatsCard
                                title="Upcoming Exams"
                                value="2"
                                icon="timer"
                                color="emerald"
                            />
                        </Link>
                    </div>
                </div>

                {/* Banner */}
                <div className="relative overflow-hidden rounded-2xl p-8 border border-[#2A2B3A] group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1A1B26] to-[#0F101A] z-0"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] z-0 group-hover:bg-primary/15 transition-all duration-500"></div>

                    <div className="relative z-10 flex flex-col justify-center h-full">
                        <p className="text-sm text-gray-400 mb-2">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Welcome back, {user?.name?.split(' ')[0] || 'User'}!
                        </h1>
                        <p className="text-gray-400 max-w-lg">Always stay updated in your student portal.</p>
                    </div>
                </div>

                {/* Quick Access Grid */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-6">Quick Access</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/payment" className="p-6 rounded-2xl bg-[#151621] border border-[#2A2B3A] hover:border-primary/50 transition-all group cursor-pointer block">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                                    <CreditCard size={24} />
                                </div>
                                <h3 className="text-lg font-semibold text-white">Payment Info</h3>
                            </div>
                            <p className="text-sm text-gray-400">View your fee status and payment history.</p>
                        </Link>

                        <Link href="/registration" className="p-6 rounded-2xl bg-[#151621] border border-[#2A2B3A] hover:border-primary/50 transition-all group cursor-pointer block">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                    <ClipboardList size={24} />
                                </div>
                                <h3 className="text-lg font-semibold text-white">Registration</h3>
                            </div>
                            <p className="text-sm text-gray-400">Course registration and semester enrollment.</p>
                        </Link>
                    </div>
                </div>

                {/* Important Notices */}
                <div className="bg-[#151621] p-6 rounded-2xl border border-[#2A2B3A]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Important Notices</h2>
                        <Link href="/notices" className="text-sm text-primary hover:text-white transition-colors">View all</Link>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-[#0B0B15] border border-[#2A2B3A]">
                            <div className="p-2 rounded-lg bg-red-500/10 text-red-500 flex-shrink-0">
                                <Bell size={20} />
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-1">Prelim payment due</h4>
                                <p className="text-sm text-gray-400">Please settle your preliminary examination fees before Oct 25th.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-[#0B0B15] border border-[#2A2B3A]">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 flex-shrink-0">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-1">Exam Schedule Released</h4>
                                <p className="text-sm text-gray-400">Final examination schedule for Fall semester is now available.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar - 1 Column */}
            <div className="xl:col-span-1 space-y-8">
                <div className="flex justify-between items-center mb-1">
                    <h2 className="text-xl font-bold text-white">Student Profile</h2>
                </div>
                <StudentProfileCard user={user} />
                <StatisticsChart />
            </div>
        </div>
    );
}
