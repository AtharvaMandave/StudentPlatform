'use client';

import { cn } from '@/lib/utils';

/**
 * Avatar - Clean avatar with initials
 */
export function Avatar({
    name,
    src,
    size = 'md',
    className,
}) {
    const sizes = {
        xs: 'w-6 h-6 text-[10px]',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
    };

    // Generate consistent background color based on name
    const getColor = (name) => {
        if (!name) return 'bg-gray-200 dark:bg-gray-700';
        const colors = [
            'bg-blue-500',
            'bg-green-500',
            'bg-yellow-500',
            'bg-red-500',
            'bg-indigo-500',
            'bg-pink-500',
            'bg-teal-500',
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const initials = name
        ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    return (
        <div className={cn('relative inline-flex', className)}>
            {src ? (
                <img
                    src={src}
                    alt={name || 'User'}
                    className={cn('rounded-full object-cover', sizes[size])}
                />
            ) : (
                <div
                    className={cn(
                        'rounded-full flex items-center justify-center font-medium text-white',
                        sizes[size],
                        getColor(name)
                    )}
                >
                    {initials}
                </div>
            )}
        </div>
    );
}

export default Avatar;
