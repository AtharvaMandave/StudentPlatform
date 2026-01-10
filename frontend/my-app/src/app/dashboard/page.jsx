'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard, CreditCard, ClipboardList, BookOpen,
    TrendingDown, Award, Bell, Calendar, LogOut, Search,
    GraduationCap, ChevronRight, Wallet, DollarSign, BarChart3, Users
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { WelcomeIllustration } from '@/components/ui/Illustrations';
import { authAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
    const router = useRouter();
    const [activeNav, setActiveNav] = useState('dashboard');

    const handleLogout = async () => {
        try {
            await authAPI.logout();
            router.push('/login');
        } catch (error) {
            router.push('/login');
        }
    };

    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'connect', icon: Users, label: 'Student Connect', href: '/connect' },
        { id: 'payment', icon: CreditCard, label: 'Payment Info' },
        { id: 'registration', icon: ClipboardList, label: 'Registration' },
        { id: 'courses', icon: BookOpen, label: 'Courses' },
        { id: 'notice', icon: Bell, label: 'Notice' },
        { id: 'schedule', icon: Calendar, label: 'Schedule' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-sidebar fixed h-full flex flex-col py-6 px-4">
                {/* Logo */}
                <div className="flex items-center gap-3 px-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <GraduationCap className="w-7 h-7 text-white" />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => (
                        item.href ? (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={cn(
                                    "nav-item",
                                    activeNav === item.id && "active"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        ) : (
                            <button
                                key={item.id}
                                onClick={() => setActiveNav(item.id)}
                                className={cn(
                                    "nav-item w-full text-left",
                                    activeNav === item.id && "active"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </button>
                        )
                    ))}
                </nav>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="nav-item w-full text-left mt-auto text-red-200 hover:text-red-100 hover:bg-red-500/20"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {/* Top Bar */}
                <header className="flex items-center justify-between mb-8">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-64 h-10 pl-10 pr-4 rounded-full border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all"
                        />
                    </div>

                    {/* User */}
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-800">John Doe</p>
                            <p className="text-xs text-gray-500">3rd year</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-semibold">
                            J
                        </div>
                        <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white -ml-3 mt-6" />
                    </div>
                </header>

                {/* Welcome Banner */}
                <div className="banner-gradient p-6 mb-8 relative overflow-hidden animate-slide-up">
                    <div className="relative z-10">
                        <p className="text-sm text-gray-600 mb-1">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, John!</h1>
                        <p className="text-gray-600">Always stay updated in your student portal</p>
                    </div>
                    <div className="absolute right-4 top-0 bottom-0 flex items-center">
                        <WelcomeIllustration className="w-64 h-48" />
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - 2/3 */}
                    <div className="lg:col-span-2 space-y-6">
                       
                   

                        {/* Enrolled Courses */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Enrolled Courses</h2>
                                <Link href="/courses" className="text-violet-600 text-sm font-medium hover:underline">
                                    See all
                                </Link>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <CourseCard
                                    title="Object oriented programming"
                                    icon="💻"
                                />
                                <CourseCard
                                    title="Fundamentals of database systems"
                                    icon="📊"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column - 1/3 */}
                    <div className="space-y-6">
                        {/* Course Instructors */}
                        <div className="card-white p-5">
                            <h3 className="font-semibold text-gray-800 mb-4">Course Instructors</h3>
                            <div className="flex -space-x-2">
                                {['bg-pink-400', 'bg-orange-400', 'bg-violet-400', 'bg-blue-400'].map((color, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-medium",
                                            color
                                        )}
                                    >
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Daily Notice */}
                        <div className="card-white p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-800">Daily notice</h3>
                                <Link href="/notices" className="text-violet-600 text-sm font-medium hover:underline">
                                    See all
                                </Link>
                            </div>
                            <div className="space-y-4">
                                <NoticeItem
                                    title="Prelim payment due"
                                    description="Sorem ipsum dolor sit amet, consectetur adipiscing elit."
                                />
                                <NoticeItem
                                    title="Exam schedule"
                                    description="Norem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function FinanceCard({ icon: Icon, amount, label, color, highlighted }) {
    return (
        <div className={cn(
            "card-white p-5 flex flex-col items-center text-center",
            highlighted && "card-purple-solid"
        )}>
            <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center mb-3",
                highlighted ? "bg-white/20" : "bg-violet-100"
            )}>
                <Icon className={cn(
                    "w-7 h-7",
                    highlighted ? "text-white" : "text-violet-600"
                )} />
            </div>
            <p className={cn(
                "text-xl font-bold mb-1",
                highlighted ? "text-white" : "text-gray-800"
            )}>
                {amount}
            </p>
            <p className={cn(
                "text-sm",
                highlighted ? "text-white/80" : "text-gray-500"
            )}>
                {label}
            </p>
        </div>
    );
}

function CourseCard({ title, icon }) {
    return (
        <div className="card-purple p-5">
            <div className="flex items-start gap-3 mb-4">
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 leading-snug">{title}</h3>
                </div>
                <div className="w-16 h-16 rounded-lg bg-white/50 flex items-center justify-center text-3xl">
                    {icon}
                </div>
            </div>
            <Button size="sm" className="px-6">
                View
            </Button>
        </div>
    );
}

function NoticeItem({ title, description }) {
    return (
        <div className="border-l-3 border-violet-500 pl-3">
            <h4 className="font-medium text-gray-800 text-sm mb-1">{title}</h4>
            <p className="text-xs text-gray-500 leading-relaxed mb-2 line-clamp-2">{description}</p>
            <Link href="#" className="text-xs text-violet-600 font-medium hover:underline">
                See more
            </Link>
        </div>
    );
}
