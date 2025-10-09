import React from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
    className?: string;
}

export const Select: React.FC<SelectProps> = ({
                                                  value,
                                                  onValueChange,
                                                  children,
                                                  className = "",
                                                  ...props
                                              }) => {
    return (
        <div className="relative w-full">
            <select
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                className={`
          appearance-none border border-gray-300 dark:border-gray-600 
          rounded-md px-3 py-2 w-full pr-8
          bg-white dark:bg-gray-800 
          text-gray-900 dark:text-gray-100
          focus:outline-none focus:ring-2 focus:ring-indigo-500
          ${className}
        `}
                {...props}
            >
                {children}
            </select>
            <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
            />
        </div>
    );
};

interface SelectItemProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
    value: string;
    children: React.ReactNode;
}

export const SelectItem: React.FC<SelectItemProps> = ({ children, ...props }) => {
    return (
        <option
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            {...props}
        >
            {children}
        </option>
    );
};