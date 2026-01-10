'use client';

import { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PasswordStrength({ password }) {
    const analysis = useMemo(() => {
        if (!password) return null;

        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
        };

        const score = Object.values(checks).filter(Boolean).length;

        let strength, color, bgColor;
        if (score <= 1) {
            strength = 'Weak';
            color = 'text-red-500';
            bgColor = 'bg-red-500';
        } else if (score <= 2) {
            strength = 'Fair';
            color = 'text-amber-500';
            bgColor = 'bg-amber-500';
        } else if (score <= 3) {
            strength = 'Good';
            color = 'text-violet-500';
            bgColor = 'bg-violet-500';
        } else {
            strength = 'Strong';
            color = 'text-emerald-500';
            bgColor = 'bg-emerald-500';
        }

        return { checks, score, strength, color, bgColor };
    }, [password]);

    if (!analysis) return null;

    return (
        <div className="mt-3 space-y-2.5 animate-fade-in">
            {/* Strength Bar */}
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Password strength</span>
                    <span className={cn("text-xs font-medium", analysis.color)}>
                        {analysis.strength}
                    </span>
                </div>
                <div className="flex gap-1">
                    {[1, 2, 3, 4].map((segment) => (
                        <div
                            key={segment}
                            className={cn(
                                "h-1.5 flex-1 rounded-full transition-all duration-300",
                                segment <= analysis.score ? analysis.bgColor : "bg-gray-200"
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Requirements */}
            <div className="grid grid-cols-2 gap-1.5">
                <Requirement met={analysis.checks.length} text="8+ characters" />
                <Requirement met={analysis.checks.uppercase} text="Uppercase" />
                <Requirement met={analysis.checks.lowercase} text="Lowercase" />
                <Requirement met={analysis.checks.number} text="Number" />
            </div>
        </div>
    );
}

function Requirement({ met, text }) {
    return (
        <div className={cn(
            "flex items-center gap-1.5 text-xs transition-colors",
            met ? "text-gray-600" : "text-gray-400"
        )}>
            {met ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
                <X className="w-3.5 h-3.5 text-gray-300" />
            )}
            <span>{text}</span>
        </div>
    );
}
