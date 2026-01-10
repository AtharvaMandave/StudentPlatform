'use client';

import { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

const Input = forwardRef(({
    label,
    type = 'text',
    icon: Icon,
    error,
    className,
    ...props
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
        <div className="space-y-1.5">
            {label && (
                <label className="block text-sm font-medium text-gray-700 ml-0.5">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200",
                        isFocused ? "text-violet-500" : "text-gray-400",
                        error && "text-red-400"
                    )}>
                        <Icon size={18} strokeWidth={1.5} />
                    </div>
                )}
                <input
                    ref={ref}
                    type={inputType}
                    className={cn(
                        "input-light",
                        Icon && "pl-10",
                        type === 'password' && "pr-10",
                        error && "border-red-300 focus:border-red-500 focus:ring-red-100",
                        className
                    )}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
                {type === 'password' && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <EyeOff size={18} strokeWidth={1.5} />
                        ) : (
                            <Eye size={18} strokeWidth={1.5} />
                        )}
                    </button>
                )}
            </div>
            {error && (
                <p className="text-sm text-red-500 ml-0.5 flex items-center gap-1">
                    {error}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
