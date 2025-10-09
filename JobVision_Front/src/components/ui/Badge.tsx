import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md' | 'lg';
    className?: string;  // <-- ajouter className ici
}

export const Badge: React.FC<BadgeProps> = ({
                                                children,
                                                variant = 'default',
                                                size = 'md',
                                                className  // <-- récupérer className
                                            }) => {
    const variants = {
        default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        success: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    };

    const sizes = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-2.5 py-1.5 text-sm',
        lg: 'px-3 py-2 text-base',
    };

    return (
        <span
            className={clsx(
                'inline-flex items-center font-medium rounded-full',
                variants[variant],
                sizes[size],
                className  // <-- appliquer className supplémentaire ici
            )}
        >
            {children}
        </span>
    );
};
