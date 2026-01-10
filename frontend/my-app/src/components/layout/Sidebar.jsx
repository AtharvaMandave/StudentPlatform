'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    ClipboardList,
    BookOpen,
    Bell,
    Calendar,
    Settings,
    HelpCircle,
    LogOut,
    ChevronRight,
    GraduationCap
} from 'lucide-react';
import { authAPI } from '@/lib/api';

const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await authAPI.getCurrentUser();
                // Response structure: { success: true, data: { user: ... } }
                if (response?.data?.user) {
                    setUser(response.data.user);
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await authAPI.logout();
            router.push('/login');
        } catch (error) {
            router.push('/login');
        }
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: Users, label: 'Student Connect', href: '/connect' },
        { icon: CreditCard, label: 'Payment Info', href: '/payment' },
        { icon: ClipboardList, label: 'Registration', href: '/registration' },
        { icon: BookOpen, label: 'Courses', href: '/courses' },
        { icon: Bell, label: 'Notice', href: '/notices' },
        { icon: Calendar, label: 'Schedule', href: '/schedule' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[var(--color-bg-sidebar)] border-r border-[#1F1F2E] flex flex-col z-50">
            {/* Logo */}
            <div className="p-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center">
                    <GraduationCap className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">CollegePortal</span>
            </div>

            {/* User Profile Snippet */}
            <div className="px-6 pb-6">
                <div className="p-3 rounded-xl bg-[#1A1B26] border border-[#2A2B3A] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Users size={20} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate">{user?.name || 'Loading...'}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role || 'Student'}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 space-y-1">
                <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Menu</p>

                {menuItems.map((item, index) => {
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={index}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${active
                                ? 'bg-primary/10 text-primary'
                                : 'text-gray-400 hover:text-white hover:bg-[#1A1B26]'
                                }`}
                        >
                            <item.icon size={20} className={active ? 'text-primary' : 'group-hover:text-white'} />
                            <span className="font-medium text-sm flex-1">{item.label}</span>
                            {active && <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>}
                        </Link>
                    );
                })}

                <div className="pt-6 pb-2">
                    <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Account</p>
                    <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A1B26] transition-all">
                        <Settings size={20} />
                        <span className="font-medium text-sm">Settings</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer"
                    >
                        <LogOut size={20} />
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
