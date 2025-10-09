import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hoverable?: boolean;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const Card: React.FC<CardProps> = ({
                                              children,
                                              className,
                                              hoverable = false
                                          }) => {
    return (
        <div
            className={clsx(
                'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700',
                hoverable && 'hover:shadow-md transition-shadow duration-200',
                className
            )}
        >
            {children}
        </div>
    );
};

export const CardHeader: React.FC<{
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}> = ({ children, className, onClick }) => {
    return (
        <div
            className={clsx('px-6 py-4 border-b border-gray-200 dark:border-gray-700', className)}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
                                                                                             children,
                                                                                             className,
                                                                                         }) => {
    return <div className={clsx('p-6', className)}>{children}</div>;
};