'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const Button = forwardRef(({
    children,
    variant = 'primary',
    size = 'default',
    loading = false,
    disabled = false,
    className,
    ...props
}, ref) => {
    const variants = {
        primary: cn(
            "bg-gradient-to-r from-violet-500 to-violet-600",
            "text-white font-medium",
            "shadow-lg shadow-violet-500/25",
            "hover:shadow-violet-500/40 hover:from-violet-600 hover:to-violet-700",
            "active:shadow-violet-500/20"
        ),
        secondary: cn(
            "bg-white",
            "text-gray-700",
            "border border-gray-200",
            "hover:bg-gray-50 hover:border-gray-300",
            "shadow-sm"
        ),
        outline: cn(
            "bg-transparent",
            "text-violet-600",
            "border-2 border-violet-500",
            "hover:bg-violet-50"
        ),
        ghost: cn(
            "bg-transparent",
            "text-gray-600",
            "hover:bg-gray-100 hover:text-gray-900"
        ),
    };

    const sizes = {
        sm: "h-9 px-4 text-sm rounded-lg",
        default: "h-11 px-5 text-sm rounded-xl",
        lg: "h-12 px-6 text-base rounded-xl",
    };

    return (
        <button
            ref={ref}
            className={cn(
                "relative inline-flex items-center justify-center gap-2",
                "font-medium transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
                "hover:-translate-y-0.5 active:translate-y-0",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading...</span>
                </>
            ) : (
                children
            )}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
