'use client';

import { Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FilterBar({ filters, setFilters, options }) {
    const hasActiveFilters =
        filters.level !== 'ALL' ||
        filters.availability !== 'ALL' ||
        filters.mode !== 'ALL';

    const clearFilters = () => {
        setFilters({
            level: 'ALL',
            availability: 'ALL',
            mode: 'ALL',
        });
    };

    return (
        <div className="bg-[#151621] border border-[#2A2B3A] p-4 rounded-xl mb-6">
            <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-white">Filters</span>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="ml-auto text-xs text-primary hover:text-white flex items-center gap-1 transition-colors"
                    >
                        <X className="w-3 h-3" />
                        Clear all
                    </button>
                )}
            </div>

            <div className="flex flex-wrap gap-3">
                {/* Level Filter */}
                <div className="flex-1 min-w-[140px]">
                    <label className="block text-xs text-gray-500 mb-1">Level</label>
                    <select
                        value={filters.level}
                        onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                        className={cn(
                            "w-full px-3 py-2 text-sm rounded-lg border bg-[#0B0B15] text-white",
                            "focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary",
                            filters.level !== 'ALL' ? "border-primary/50 text-white" : "border-[#2A2B3A] text-gray-400"
                        )}
                    >
                        {options.levels.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-[#0B0B15]">{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Availability Filter */}
                <div className="flex-1 min-w-[140px]">
                    <label className="block text-xs text-gray-500 mb-1">Availability</label>
                    <select
                        value={filters.availability}
                        onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                        className={cn(
                            "w-full px-3 py-2 text-sm rounded-lg border bg-[#0B0B15] text-white",
                            "focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary",
                            filters.availability !== 'ALL' ? "border-primary/50 text-white" : "border-[#2A2B3A] text-gray-400"
                        )}
                    >
                        {options.availability.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-[#0B0B15]">{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Mode Filter */}
                <div className="flex-1 min-w-[140px]">
                    <label className="block text-xs text-gray-500 mb-1">Study Mode</label>
                    <select
                        value={filters.mode}
                        onChange={(e) => setFilters(prev => ({ ...prev, mode: e.target.value }))}
                        className={cn(
                            "w-full px-3 py-2 text-sm rounded-lg border bg-[#0B0B15] text-white",
                            "focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary",
                            filters.mode !== 'ALL' ? "border-primary/50 text-white" : "border-[#2A2B3A] text-gray-400"
                        )}
                    >
                        {options.modes.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-[#0B0B15]">{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
