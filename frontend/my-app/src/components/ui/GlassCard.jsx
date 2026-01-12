'use client';

import { cn } from '@/lib/utils';

/**
 * Card - Clean, professional card component
 */
export function Card({
    children,
    className,
    padding = true,
    hover = false,
    border = true,
    ...props
}) {
    return (
        <div
            className={cn(
                'rounded-lg bg-white dark:bg-[#18181B]',
                border && 'border border-gray-200 dark:border-[#27272A]',
                padding && 'p-5',
                hover && 'transition-shadow hover:shadow-md dark:hover:border-[#3F3F46]',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

/**
 * CardHeader - For card titles
 */
export function CardHeader({ title, subtitle, action, className }) {
    return (
        <div className={cn('flex items-center justify-between mb-4', className)}>
            <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
                {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

/**
 * StatCard - For displaying metrics
 */
export function StatCard({ label, value, icon: Icon, change, className }) {
    return (
        <Card className={cn('', className)} hover>
            <div className="flex items-start justify-between">
                {Icon && (
                    <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#27272A] flex items-center justify-center">
                        <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                )}
                {change && (
                    <span className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded-full',
                        change >= 0
                            ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    )}>
                        {change >= 0 ? '+' : ''}{change}%
                    </span>
                )}
            </div>
            <div className="mt-3">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            </div>
        </Card>
    );
}

export default Card;
