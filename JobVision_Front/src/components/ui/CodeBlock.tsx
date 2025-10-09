import React from 'react';
import { clsx } from 'clsx';
import { Copy } from 'lucide-react';
import { Button } from './Button';

interface CodeBlockProps {
    code: string;
    language?: string;
    className?: string;
    showLineNumbers?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
                                                        code,
                                                        language = '',
                                                        className,
                                                        showLineNumbers = false
                                                    }) => {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
    };

    // Simple syntax highlighting (you might want to use a library like Prism.js for more advanced highlighting)
    const getHighlightedCode = () => {
        if (language === 'bash') {
            return code.replace(/^(\$|#).*/gm, '<span class="text-yellow-500">$&</span>');
        }
        if (language === 'python') {
            return code.replace(/^(def|class|import|from|if|else|for|while|return)\b/gm, '<span class="text-blue-500">$1</span>');
        }
        if (language === 'sql') {
            return code.replace(/^(SELECT|FROM|WHERE|JOIN|INSERT|UPDATE|DELETE|CREATE|ALTER)\b/gmi, '<span class="text-purple-500">$1</span>');
        }
        return code;
    };

    return (
        <div className={clsx(
            'relative bg-gray-800 dark:bg-gray-900 rounded-md overflow-hidden',
            className
        )}>
            <div className="flex justify-between items-center bg-gray-700 dark:bg-gray-800 px-4 py-2">
                <span className="text-xs text-gray-300">{language || 'code'}</span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="text-gray-300 hover:text-white"
                >
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm text-gray-100">
        <code
            dangerouslySetInnerHTML={{ __html: getHighlightedCode() }}
            className={clsx(
                'font-mono',
                showLineNumbers && 'line-numbers'
            )}
        />
      </pre>
        </div>
    );
};