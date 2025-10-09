import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { Button } from './Button';
import { X } from 'lucide-react';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
                                                open,
                                                onClose,
                                                title,
                                                children,
                                                size = 'md',
                                                footer
                                            }) => {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    if (!open) return null;

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl'
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
            className="fixed inset-0 transition-opacity"
    onClick={onClose}
    >
    <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>

        <div className={clsx(
        'inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full',
        sizes[size]
)}>
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        {title}
        </h3>
        <Button
    variant="ghost"
    size="sm"
    onClick={onClose}
    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
    >
    <X className="h-5 w-5" />
        </Button>
        </div>

        <div className="px-6 py-4">
        {children}
        </div>

    {footer && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
            {footer}
            </div>
    )}
    </div>
    </div>
    </div>
);
};