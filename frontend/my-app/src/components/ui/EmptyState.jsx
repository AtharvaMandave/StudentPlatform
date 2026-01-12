'use client';

import { cn } from '@/lib/utils';

/**
 * EmptyState - Clean empty state
 */
export function EmptyState({
    title,
    description,
    action,
    actionLabel,
    icon: Icon,
    className,
}) {
    return (
        <div className={cn('text-center py-12 px-4', className)}>
            {Icon && (
                <div className="w-10 h-10 bg-gray-100 dark:bg-[#27272A] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
            )}
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">{description}</p>
            {action && (
                <button
                    onClick={action}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

/**
 * LoadingState - Minimal skeleton loading
 */
export function LoadingState({ count = 3, type = 'card', className }) {
    const Skeleton = ({ className }) => (
        <div className={cn('animate-pulse bg-gray-200 dark:bg-[#27272A] rounded', className)} />
    );

    const CardSkeleton = () => (
        <div className="border border-gray-200 dark:border-[#27272A] rounded-lg p-5">
            <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-3/4" />
        </div>
    );

    const RowSkeleton = () => (
        <div className="flex items-center gap-4 p-4 border border-gray-200 dark:border-[#27272A] rounded-lg">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-8 w-20 rounded-md" />
        </div>
    );

    return (
        <div className={cn(
            type === 'card' && 'grid md:grid-cols-2 lg:grid-cols-3 gap-6',
            type === 'row' && 'space-y-3',
            className
        )}>
            {Array.from({ length: count }).map((_, i) => (
                type === 'row' ? <RowSkeleton key={i} /> : <CardSkeleton key={i} />
            ))}
        </div>
    );
}

export default EmptyState;
