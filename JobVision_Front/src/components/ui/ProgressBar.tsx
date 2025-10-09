import React from 'react';
import { clsx } from 'clsx';

interface ProgressBarProps {
    value: number;
    max?: number;
    className?: string;
    variant?: 'default' | 'success' | 'warning' | 'error';
    size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
                                                            value,
                                                            max = 100,
                                                            className,
                                                            variant = 'default',
                                                            size = 'md'
                                                        }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const computedVariant = value === 100 ? 'success' : variant;

    const variants = {
        default: 'bg-blue-500',
        success: 'bg-gradient-to-r from-green-300 to-green-600', // dégradé vert
        warning: 'bg-gradient-to-r from-yellow-300 to-yellow-600',
        error: 'bg-gradient-to-r from-red-300 to-red-600',
    };

    const sizes = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
    };

    return (
        <div className={clsx('w-full bg-gray-200 rounded-full overflow-hidden', sizes[size], className)}>
            <div
                className={clsx(
                    'h-full rounded-full transition-all duration-300 ease-in-out',
                    variants[computedVariant]
                )}
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
};
