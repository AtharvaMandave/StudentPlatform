'use client';

import { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const variants = {
    success: {
        icon: CheckCircle2,
        bg: 'bg-emerald-50 border-emerald-200',
        text: 'text-emerald-700',
        iconColor: 'text-emerald-500',
    },
    error: {
        icon: XCircle,
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-700',
        iconColor: 'text-red-500',
    },
    warning: {
        icon: AlertTriangle,
        bg: 'bg-amber-50 border-amber-200',
        text: 'text-amber-700',
        iconColor: 'text-amber-500',
    },
    info: {
        icon: Info,
        bg: 'bg-blue-50 border-blue-200',
        text: 'text-blue-700',
        iconColor: 'text-blue-500',
    },
};

export default function Alert({ type = 'info', message, onClose, autoClose = true }) {
    const variant = variants[type];
    const Icon = variant.icon;

    useEffect(() => {
        if (autoClose && onClose) {
            const timer = setTimeout(onClose, 5000);
            return () => clearTimeout(timer);
        }
    }, [autoClose, onClose]);

    return (
        <div className={cn(
            "fixed top-4 right-4 z-50 max-w-sm w-full",
            "border rounded-xl p-4 pr-10",
            "shadow-lg animate-slide-up",
            variant.bg
        )}>
            <div className="flex items-start gap-3">
                <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", variant.iconColor)} />
                <p className={cn("text-sm font-medium", variant.text)}>
                    {message}
                </p>
                {onClose && (
                    <button
                        onClick={onClose}
                        className={cn(
                            "absolute top-4 right-4 transition-opacity",
                            variant.iconColor,
                            "opacity-60 hover:opacity-100"
                        )}
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
