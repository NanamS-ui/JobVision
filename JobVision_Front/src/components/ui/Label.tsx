import React from "react";
import { clsx } from "clsx";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean;
    disabled?: boolean;
    error?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
    ({ className, children, required, disabled, error, ...props }, ref) => {
        return (
            <label
                ref={ref}
                className={clsx(
                    "text-sm font-medium leading-none",
                    disabled
                        ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                        : error
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-700 dark:text-gray-300",
                    "peer-disabled:text-gray-400 peer-disabled:dark:text-gray-500 peer-disabled:cursor-not-allowed",
                    className
                )}
                {...props}
            >
                {children}
                {required && (
                    <span className="ml-1 text-red-600 dark:text-red-400">*</span>
                )}
            </label>
        );
    }
);

Label.displayName = "Label";

export { Label };