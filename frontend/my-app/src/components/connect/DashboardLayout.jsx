'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Users, Search, UserPlus, MessageSquare, Settings, LogOut,
    GraduationCap, Bell, ChevronLeft, Menu, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { authAPI } from '@/lib/api';

const navItems = [
    { href: '/connect', icon: Search, label: 'Discover' },
    { href: '/connect/partners', icon: Users, label: 'My Partners' },
    { href: '/connect/requests', icon: UserPlus, label: 'Requests' },
    { href: '/connect/profile', icon: Settings, label: 'Profile' },
];

export default function DashboardLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await authAPI.logout();
            router.push('/login');
        } catch (error) {
            router.push('/login');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed lg:static inset-y-0 left-0 z-40",
                "w-64 bg-sidebar flex flex-col py-6 px-4",
                "transform transition-transform duration-200",
                sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                {/* Logo */}
                <div className="flex items-center justify-between px-3 mb-8">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <GraduationCap className="w-7 h-7 text-white" />
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-white/70 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Section Title */}
                <div className="px-3 mb-4">
                    <p className="text-xs font-medium text-white/50 uppercase tracking-wider">
                        Student Connect
                    </p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "nav-item",
                                pathname === item.href && "active"
                            )}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Bottom section */}
                <div className="space-y-1 pt-4 border-t border-white/10">
                    <Link
                        href="/dashboard"
                        className="nav-item"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span>Back to Dashboard</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="nav-item w-full text-left text-red-200 hover:text-red-100 hover:bg-red-500/20"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-0">
                {/* Top Bar */}
                <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                        >
                            <Menu className="w-6 h-6 text-gray-600" />
                        </button>

                        <div className="flex-1 lg:flex-none" />

                        <div className="flex items-center gap-4">
                            <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white font-semibold">
                                J
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                {children}
            </main>
        </div>
    );
}
