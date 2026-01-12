'use client';

import { cn } from '@/lib/utils';

/**
 * ProgressBar - Simple progress bar
 */
export function ProgressBar({
    progress,
    size = 'md',
    color = 'default', // default (blue), success (green), warning (yellow)
    showValue = false,
    className,
}) {
    const heights = {
        xs: 'h-1',
        sm: 'h-1.5',
        md: 'h-2',
        lg: 'h-3',
    };

    const colors = {
        default: 'bg-blue-600 dark:bg-blue-500',
        success: 'bg-green-600 dark:bg-green-500',
        warning: 'bg-yellow-600 dark:bg-yellow-500',
        danger: 'bg-red-600 dark:bg-red-500',
        primary: 'bg-gray-900 dark:bg-white',
    };

    return (
        <div className={cn('w-full', className)}>
            <div className="flex justify-between mb-1">
                {showValue && (
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {Math.round(progress)}%
                    </span>
                )}
            </div>
            <div className={cn('w-full bg-gray-200 dark:bg-[#27272A] rounded-full overflow-hidden', heights[size])}>
                <div
                    className={cn('h-full transition-all duration-500 rounded-full', colors[color] || colors.default)}
                    style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                />
            </div>
        </div>
    );
}

/**
 * ProgressRing - Minimalist circular progress
 */
export function ProgressRing({
    progress,
    size = 'md',
    color = 'default',
    strokeWidth = 3,
    showValue = true,
    className,
}) {
    const sizes = {
        xs: 24,
        sm: 32,
        md: 48,
        lg: 64,
        xl: 80,
    };

    // Ensure size is a number
    const dimension = typeof size === 'string' ? sizes[size] : size;
    const center = dimension / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.max(0, Math.min(100, progress)) / 100) * circumference;

    const colors = {
        default: 'text-blue-600 dark:text-blue-500',
        success: 'text-green-600 dark:text-green-500',
        warning: 'text-yellow-600 dark:text-yellow-500',
        danger: 'text-red-600 dark:text-red-500',
        emerald: 'text-emerald-600 dark:text-emerald-500',
        primary: 'text-gray-900 dark:text-white',
    };

    return (
        <div className={cn('relative inline-flex items-center justify-center', className)}>
            <svg
                width={dimension}
                height={dimension}
                viewBox={`0 0 ${dimension} ${dimension}`}
                className="transform -rotate-90"
            >
                {/* Background Ring */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-gray-200 dark:text-[#27272A]"
                />

                {/* Progress Ring */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={cn('transition-all duration-500', colors[color] || colors.default)}
                />
            </svg>

            {showValue && (
                <span className={cn(
                    'absolute font-medium text-gray-900 dark:text-white',
                    dimension < 40 ? 'text-[10px]' : 'text-xs'
                )}>
                    {Math.round(progress)}
                </span>
            )}
        </div>
    );
}

export default ProgressBar;
