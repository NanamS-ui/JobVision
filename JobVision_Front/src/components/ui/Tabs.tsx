import React from 'react';
import { clsx } from 'clsx';

interface TabsProps {
    children: React.ReactNode;
    defaultValue?: string;
    value?: string;
    className?: string;
    onValueChange?: (value: string) => void;
}

const TabsComponent: React.FC<TabsProps> & {
    List: typeof TabsList;
    Trigger: typeof TabTrigger;
    Content: typeof TabsContent;
} = ({ children, defaultValue, value, className, onValueChange }) => {
    const [internalTab, setInternalTab] = React.useState(defaultValue);
    const activeTab = value ?? internalTab;

    const handleTabChange = (val: string) => {
        setInternalTab(val);
        onValueChange?.(val);
    };

    return (
        <div className={clsx('flex flex-col', className)}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    if (child.type === TabsList) {
                        return React.cloneElement(child as React.ReactElement<TabsListProps>, {
                            activeTab,
                            onTabChange: handleTabChange,
                        });
                    }
                    if (child.type === TabsContent) {
                        return React.cloneElement(child as React.ReactElement<TabsContentProps>, {
                            activeTab,
                        });
                    }
                }
                return child;
            })}
        </div>
    );
};

interface TabsListProps {
    children: React.ReactNode;
    activeTab?: string;
    onTabChange?: (value: string) => void;
    className?: string;
}

const TabsList: React.FC<TabsListProps> = ({ children, activeTab, onTabChange, className }) => {
    return (
        <div className={clsx('border-b border-gray-200 dark:border-gray-700', className)}>
            <nav className="-mb-px flex space-x-8">
                {React.Children.map(children, (child) => {
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child as React.ReactElement<TabTriggerProps>, {
                            active: child.props.value === activeTab,
                            onSelect: () => onTabChange?.(child.props.value),
                        });
                    }
                    return child;
                })}
            </nav>
        </div>
    );
};

interface TabTriggerProps {
    value: string;
    children: React.ReactNode;
    active?: boolean;
    onSelect?: () => void;
    className?: string;
    icon?: React.ReactNode;
}

const TabTrigger: React.FC<TabTriggerProps> = ({ children, active, onSelect, className }) => {
    return (
        <button
            onClick={onSelect}
            className={clsx(
                'flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                active
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                className
            )}
        >
            {children}
        </button>
    );
};

interface TabsContentProps {
    value: string;
    children: React.ReactNode;
    activeTab?: string;
    className?: string;
}

const TabsContent: React.FC<TabsContentProps> = ({ value, children, activeTab, className }) => {
    return (
        <div className={clsx('py-4', value !== activeTab && 'hidden', className)}>
            {children}
        </div>
    );
};

TabsComponent.List = TabsList;
TabsComponent.Trigger = TabTrigger;
TabsComponent.Content = TabsContent;

export const Tabs = TabsComponent;