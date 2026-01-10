'use client';
import { Search, Bell, History, Menu } from 'lucide-react';

const Header = () => {
    return (
        <header className="h-20 px-8 flex items-center justify-between border-b border-[#1F1F2E]/50 bg-[var(--color-bg-main)]/50 backdrop-blur-sm sticky top-0 z-40">
            {/* Left Breadcrumbs/Title */}
            <div className="flex items-center gap-4 text-gray-400">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="opacity-50">Portal</span>
                    <span className="opacity-50">/</span>
                    <span className="text-white font-medium">Dashboard</span>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
                {/* Search Bar */}
                <div className="relative group hidden md:block">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search courses, notices..."
                        className="pl-10 pr-12 py-2 bg-[#1A1B26] border border-[#2A2B3A] rounded-full text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 w-64 transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs border border-gray-700 rounded px-1.5 py-0.5">/</span>
                </div>

                {/* Icons */}
                <div className="flex items-center gap-4 text-gray-400">
                    <button className="hover:text-white transition-colors">
                        <History size={20} />
                    </button>
                    <button className="relative hover:text-white transition-colors">
                        <Bell size={20} />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0B0B15]"></span>
                    </button>
                </div>

                <div className="h-6 w-px bg-[#2A2B3A]"></div>

                {/* User - Simplified for Header */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                        JD
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
