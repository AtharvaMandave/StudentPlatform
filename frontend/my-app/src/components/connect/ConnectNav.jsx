'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    Users, Compass, CalendarCheck, MessageSquare, Bell, Trophy, TrendingUp, FolderOpen
} from 'lucide-react';

export default function ConnectNav({ pendingCount = 0 }) {
    const pathname = usePathname();

    const navItems = [
        { href: '/connect', label: 'Discover', icon: Compass },
        { href: '/connect/partners', label: 'My Partners', icon: Users },
        { href: '/connect/requests', label: 'Requests', icon: Bell, badge: pendingCount },
        { href: '/connect/resources', label: 'Resources', icon: FolderOpen },
        { href: '/connect/progress', label: 'Progress', icon: TrendingUp },
        { href: '/connect/milestones', label: 'Milestones', icon: Trophy },
    ];

    return (
        <nav className="flex items-center gap-1 mb-8 overflow-x-auto pb-1 border-b border-gray-200 dark:border-[#27272A] no-scrollbar">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all whitespace-nowrap",
                            isActive
                                ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                        )}
                    >
                        <Icon className={cn("w-4 h-4", isActive ? "text-gray-900 dark:text-white" : "text-gray-400")} />
                        {item.label}
                        {item.badge > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-600">
                                {item.badge}
                            </span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
