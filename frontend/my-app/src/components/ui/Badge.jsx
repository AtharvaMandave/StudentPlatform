'use client';

import { cn } from '@/lib/utils';

/**
 * Badge - Simple, clean badge
 */
export function Badge({
    children,
    variant = 'default',
    size = 'sm',
    className,
}) {
    const variants = {
        default: 'bg-gray-100 text-gray-700 dark:bg-[#27272A] dark:text-gray-300',
        primary: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        success: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
        warning: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
        danger: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
        info: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    };

    const sizes = {
        xs: 'text-[10px] px-1.5 py-0.5',
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-md font-medium',
                variants[variant],
                sizes[size],
                className
            )}
        >
            {children}
        </span>
    );
}

/**
 * StatusBadge - Predefined status badges
 */
export function StatusBadge({ status }) {
    const configs = {
        online: { label: 'Online', variant: 'success' },
        offline: { label: 'Offline', variant: 'default' },
        active: { label: 'Active', variant: 'success' },
        pending: { label: 'Pending', variant: 'warning' },
        completed: { label: 'Completed', variant: 'success' },
        in_progress: { label: 'In Progress', variant: 'primary' },
        not_started: { label: 'Not Started', variant: 'default' },
        submitted: { label: 'Submitted', variant: 'success' },
        draft: { label: 'Draft', variant: 'warning' },
    };

    const config = configs[status?.toLowerCase()] || { label: status, variant: 'default' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
}

export default Badge;
