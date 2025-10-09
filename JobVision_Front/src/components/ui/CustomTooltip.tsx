// components/ui/CustomTooltip.tsx
import React, { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CustomTooltipProps {
    content: ReactNode;
    children: ReactNode;
    className?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
                                                                content,
                                                                children,
                                                                className,
                                                                position = 'top',
                                                            }) => {
    return (
        <div className="relative group inline-block">
            {children}
            <div
                className={clsx(
                    'absolute z-10 whitespace-nowrap bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none',
                    {
                        'bottom-full left-1/2 -translate-x-1/2 mb-2': position === 'top',
                        'top-full left-1/2 -translate-x-1/2 mt-2': position === 'bottom',
                        'right-full top-1/2 -translate-y-1/2 mr-2': position === 'left',
                        'left-full top-1/2 -translate-y-1/2 ml-2': position === 'right',
                    },
                    className
                )}
            >
                {content}
            </div>
        </div>
    );
};
