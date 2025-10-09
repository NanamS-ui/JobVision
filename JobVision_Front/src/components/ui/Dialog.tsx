import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
    className?: string;
    paddingClass?: string;
}

interface DialogSubcomponentProps {
    children: React.ReactNode;
    className?: string;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (open) {
            setIsVisible(true);
            setIsAnimating(true);
            document.body.style.overflow = 'hidden';
        } else {
            setIsAnimating(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setIsAnimating(false);
            }, 200); // Match the transition duration
            return () => clearTimeout(timer);
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                onOpenChange(false);
            }
        };

        if (open) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open, onOpenChange]);

    if (!isVisible) return null;

    return createPortal(
        <>
            {/* Enhanced Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-200 ease-in-out ${
                    open ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={() => onOpenChange(false)}
                aria-hidden="true"
            />

            {/* Enhanced Modal wrapper */}
            <div
                role="dialog"
                aria-modal="true"
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
                <div
                    className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-gray-200/50 dark:border-gray-700/50 transition-all duration-200 ease-out transform ${
                        open 
                            ? 'opacity-100 scale-100 translate-y-0' 
                            : 'opacity-0 scale-95 translate-y-4'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                    }}
                >
                    {/* Modal content with enhanced styling */}
                    <div className="relative">
                        {children}
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
};

// Enhanced Dialog subcomponents
export const DialogHeader: React.FC<DialogSubcomponentProps> = ({ children, className = '' }) => (
    <div className={`px-6 py-5 border-b border-gray-200/60 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-800/50 ${className}`}>
        {children}
    </div>
);

export const DialogTitle: React.FC<DialogSubcomponentProps> = ({ children, className = '' }) => (
    <h2 className={`text-xl font-semibold text-gray-900 dark:text-gray-100 leading-tight ${className}`}>
        {children}
    </h2>
);

export const DialogContent: React.FC<DialogSubcomponentProps> = ({ children, className = '' }) => (
    <div className={`px-6 py-6 space-y-4 ${className}`}>
        {children}
    </div>
);

export const DialogFooter: React.FC<DialogSubcomponentProps> = ({ children, className = '' }) => (
    <div className={`px-6 py-4 border-t border-gray-200/60 dark:border-gray-700/60 bg-gray-50/30 dark:bg-gray-800/30 flex justify-end gap-3 ${className}`}>
        {children}
    </div>
);