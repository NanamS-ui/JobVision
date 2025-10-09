import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

interface PopupMessageProps {
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    onClose: () => void;
    duration?: number;
    title?: string;
    showCloseButton?: boolean;
    position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center' | 'center';
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
    animated?: boolean;
}

const PopupMessage: React.FC<PopupMessageProps> = ({
       message,
       type = 'info',
       onClose,
       duration = 4000,
       title,
       showCloseButton = true,
       position = 'top-right',
       size = 'md',
       showIcon = true,
       animated = true
    }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        // Animation d'entrée
        const showTimer = setTimeout(() => setIsVisible(true), 50);

        // Barre de progression
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev - (100 / (duration / 100));
                return newProgress <= 0 ? 0 : newProgress;
            });
        }, 100);

        // Fermeture automatique
        const closeTimer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(closeTimer);
            clearInterval(progressInterval);
        };
    }, [duration]);

    const handleClose = () => {
        setIsRemoving(true);
        setTimeout(() => onClose(), 300);
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-6 w-6" />;
            case 'error':
                return <AlertCircle className="h-6 w-6" />;
            case 'warning':
                return <AlertTriangle className="h-6 w-6" />;
            case 'info':
                return <Info className="h-6 w-6" />;
            default:
                return <Sparkles className="h-6 w-6" />;
        }
    };

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-900/90 dark:via-emerald-900/80 dark:to-green-800/90',
                    border: 'border-green-200/60 dark:border-green-700/60',
                    icon: 'text-green-600 dark:text-green-400',
                    title: 'text-green-900 dark:text-green-100',
                    text: 'text-green-800 dark:text-green-200',
                    glow: 'shadow-green-500/25 dark:shadow-green-400/20',
                    progress: 'bg-green-500',
                    particles: 'from-green-400 to-emerald-500'
                };
            case 'error':
                return {
                    bg: 'bg-gradient-to-br from-red-50 via-rose-50 to-red-100 dark:from-red-900/90 dark:via-rose-900/80 dark:to-red-800/90',
                    border: 'border-red-200/60 dark:border-red-700/60',
                    icon: 'text-red-600 dark:text-red-400',
                    title: 'text-red-900 dark:text-red-100',
                    text: 'text-red-800 dark:text-red-200',
                    glow: 'shadow-red-500/25 dark:shadow-red-400/20',
                    progress: 'bg-red-500',
                    particles: 'from-red-400 to-rose-500'
                };
            case 'warning':
                return {
                    bg: 'bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 dark:from-yellow-900/90 dark:via-amber-900/80 dark:to-yellow-800/90',
                    border: 'border-yellow-200/60 dark:border-yellow-700/60',
                    icon: 'text-yellow-600 dark:text-yellow-400',
                    title: 'text-yellow-900 dark:text-yellow-100',
                    text: 'text-yellow-800 dark:text-yellow-200',
                    glow: 'shadow-yellow-500/25 dark:shadow-yellow-400/20',
                    progress: 'bg-yellow-500',
                    particles: 'from-yellow-400 to-amber-500'
                };
            case 'info':
                return {
                    bg: 'bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 dark:from-blue-900/90 dark:via-sky-900/80 dark:to-blue-800/90',
                    border: 'border-blue-200/60 dark:border-blue-700/60',
                    icon: 'text-blue-600 dark:text-blue-400',
                    title: 'text-blue-900 dark:text-blue-100',
                    text: 'text-blue-800 dark:text-blue-200',
                    glow: 'shadow-blue-500/25 dark:shadow-blue-400/20',
                    progress: 'bg-blue-500',
                    particles: 'from-blue-400 to-sky-500'
                };
            default:
                return {
                    bg: 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-gray-800/90 dark:via-slate-800/80 dark:to-gray-700/90',
                    border: 'border-gray-200/60 dark:border-gray-600/60',
                    icon: 'text-gray-600 dark:text-gray-400',
                    title: 'text-gray-900 dark:text-gray-100',
                    text: 'text-gray-800 dark:text-gray-200',
                    glow: 'shadow-gray-500/25 dark:shadow-gray-400/20',
                    progress: 'bg-gray-500',
                    particles: 'from-gray-400 to-slate-500'
                };
        }
    };

    const getPositionStyles = () => {
        switch (position) {
            case 'top-left':
                return 'top-6 left-6';
            case 'top-center':
                return 'top-6 left-1/2 transform -translate-x-1/2';
            case 'top-right':
                return 'top-6 right-6';
            case 'bottom-left':
                return 'bottom-6 left-6';
            case 'bottom-center':
                return 'bottom-6 left-1/2 transform -translate-x-1/2';
            case 'bottom-right':
                return 'bottom-6 right-6';
            case 'center':
                return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
            default:
                return 'top-6 right-6';
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return 'max-w-sm p-4';
            case 'lg':
                return 'max-w-lg p-6';
            default:
                return 'max-w-md p-5';
        }
    };

    const styles = getTypeStyles();

    return (
        <div className={clsx('fixed z-50', getPositionStyles())}>
            {/* Backdrop blur effect */}
            <div className="absolute inset-0 backdrop-blur-sm bg-black/5 dark:bg-black/10 rounded-2xl"></div>

            {/* Main popup container */}
            <div
                className={clsx(
                    'relative overflow-hidden rounded-2xl border backdrop-blur-md transition-all duration-300 transform',
                    getSizeStyles(),
                    styles.bg,
                    styles.border,
                    `shadow-2xl ${styles.glow}`,
                    animated && (isVisible && !isRemoving
                        ? 'translate-y-0 opacity-100 scale-100'
                        : position.includes('top')
                            ? '-translate-y-8 opacity-0 scale-95'
                            : 'translate-y-8 opacity-0 scale-95')
                )}
            >
                {/* Animated background particles */}
                {animated && (
                    <div className="absolute inset-0 overflow-hidden">
                        <div className={`absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br ${styles.particles} rounded-full opacity-10 animate-float`}></div>
                        <div className={`absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br ${styles.particles} rounded-full opacity-15 animate-float-delayed`}></div>
                        <div className={`absolute top-1/2 right-1/4 w-8 h-8 bg-gradient-to-br ${styles.particles} rounded-full opacity-20 animate-pulse-slow`}></div>
                    </div>
                )}

                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>

                {/* Content */}
                <div className="relative z-10">
                    <div className="flex items-start space-x-4">
                        {/* Icon */}
                        {showIcon && (
                            <div className={clsx(
                                'flex-shrink-0 p-2 rounded-xl transition-all duration-300',
                                styles.icon,
                                'bg-white/20 dark:bg-black/10 backdrop-blur-sm',
                                animated && 'animate-bounce-subtle'
                            )}>
                                {getIcon()}
                            </div>
                        )}

                        {/* Text content */}
                        <div className="flex-1 min-w-0">
                            {title && (
                                <h4 className={clsx(
                                    'font-semibold mb-1 text-lg',
                                    styles.title
                                )}>
                                    {title}
                                </h4>
                            )}
                            <p className={clsx(
                                'text-sm leading-relaxed',
                                styles.text
                            )}>
                                {message}
                            </p>
                        </div>

                        {/* Close button */}
                        {showCloseButton && (
                            <button
                                onClick={handleClose}
                                className={clsx(
                                    'flex-shrink-0 p-2 rounded-lg transition-all duration-200',
                                    'hover:bg-black/10 dark:hover:bg-white/10',
                                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current',
                                    styles.icon
                                )}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div
                        className={clsx(
                            'h-full transition-all ease-linear duration-100',
                            styles.progress,
                            'shadow-lg'
                        )}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Glow effect */}
                <div className={clsx(
                    'absolute inset-0 rounded-2xl opacity-50 blur-xl',
                    styles.progress.replace('bg-', 'bg-gradient-to-r from-'),
                    'to-transparent'
                )}></div>
            </div>
        </div>
    );
};

export default PopupMessage;