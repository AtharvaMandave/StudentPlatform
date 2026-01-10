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
        <div className="card-white p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters</span>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="ml-auto text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1"
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
                            "w-full px-3 py-2 text-sm rounded-lg border bg-white",
                            "focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500",
                            filters.level !== 'ALL' ? "border-violet-300 bg-violet-50" : "border-gray-200"
                        )}
                    >
                        {options.levels.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
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
                            "w-full px-3 py-2 text-sm rounded-lg border bg-white",
                            "focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500",
                            filters.availability !== 'ALL' ? "border-violet-300 bg-violet-50" : "border-gray-200"
                        )}
                    >
                        {options.availability.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
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
                            "w-full px-3 py-2 text-sm rounded-lg border bg-white",
                            "focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500",
                            filters.mode !== 'ALL' ? "border-violet-300 bg-violet-50" : "border-gray-200"
                        )}
                    >
                        {options.modes.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
