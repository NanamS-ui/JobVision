import React, { createContext, useContext, useState } from 'react';

// Types
type PopoverContextType = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type PopoverProps = {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
};

type PopoverTriggerProps = {
    children: React.ReactNode;
    asChild?: boolean;
};

type PopoverContentProps = {
    children: React.ReactNode;
    className?: string;
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'right' | 'bottom' | 'left';
    sideOffset?: number;
};

// Context
const PopoverContext = createContext<PopoverContextType | null>(null);

// Main Popover Component
export const Popover = ({
                            open: propOpen,
                            onOpenChange: propOnOpenChange,
                            children
                        }: PopoverProps) => {
    const [internalOpen, setInternalOpen] = useState(false);

    const isControlled = propOpen !== undefined;
    const open = isControlled ? propOpen : internalOpen;

    const onOpenChange = (newOpen: boolean) => {
        if (!isControlled) {
            setInternalOpen(newOpen);
        }
        propOnOpenChange?.(newOpen);
    };

    return (
        <PopoverContext.Provider value={{ open, onOpenChange }}>
            <div className="relative inline-block">{children}</div>
        </PopoverContext.Provider>
    );
};

// Popover Trigger Component
export const PopoverTrigger = ({
                                   children,
                                   asChild = false
                               }: PopoverTriggerProps) => {
    const context = useContext(PopoverContext);

    if (!context) {
        throw new Error('PopoverTrigger must be used within a Popover');
    }

    const { open, onOpenChange } = context;

    const handleClick = () => {
        onOpenChange(!open);
    };

    if (asChild) {
        return React.cloneElement(React.Children.only(children) as React.ReactElement, {
            onClick: (e: React.MouseEvent) => {
                const childProps = (children as React.ReactElement).props;
                childProps.onClick?.(e);
                handleClick();
            },
        });
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-expanded={open}
            aria-haspopup="true"
            className="focus:outline-none"
        >
            {children}
        </button>
    );
};

// Popover Content Component
export const PopoverContent = ({
                                   children,
                                   className = '',
                                   align = 'center',
                                   side = 'bottom',
                                   sideOffset = 4
                               }: PopoverContentProps) => {
    const context = useContext(PopoverContext);

    if (!context) {
        throw new Error('PopoverContent must be used within a Popover');
    }

    const { open } = context;

    if (!open) return null;

    // Alignment classes
    const alignmentClasses = {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
    };

    // Side classes
    const sideClasses = {
        top: 'bottom-full mb-2',
        right: 'left-full ml-2',
        bottom: 'top-full mt-2',
        left: 'right-full mr-2',
    };

    return (
        <div
            className={`
        absolute z-50 min-w-[8rem] rounded-md border bg-popover p-1 
        text-popover-foreground shadow-md outline-none
        ${sideClasses[side]}
        ${alignmentClasses[align]}
        ${className}
      `}
            style={{ margin: `${sideOffset}px` }}
        >
            {children}
        </div>
    );
};