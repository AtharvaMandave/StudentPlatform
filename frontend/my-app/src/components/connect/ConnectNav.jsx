'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Search, Users, UserPlus, Settings } from 'lucide-react';

export default function ConnectNav() {
    const pathname = usePathname();

    const tabs = [
        { name: 'Discover', href: '/connect', icon: Search },
        { name: 'My Partners', href: '/connect/partners', icon: Users },
        { name: 'Requests', href: '/connect/requests', icon: UserPlus },
        { name: 'Profile', href: '/connect/profile', icon: Settings },
    ];

    return (
        <div className="flex flex-wrap items-center gap-2 mb-8 bg-[#151621] p-1.5 rounded-xl border border-[#2A2B3A] w-fit">
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                            isActive
                                ? "bg-primary text-white shadow-lg shadow-primary/25"
                                : "text-gray-400 hover:text-white hover:bg-[#1E1F2E]"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.name}
                    </Link>
                );
            })}
        </div>
    );
}
