import React, { useEffect, useRef, useState } from 'react';
import {  CardContent, CardHeader } from './Card';
import { Button } from './Button';
import { X, Send, Bot, Maximize2, Minimize2, Loader2 } from 'lucide-react';
import { sendAssistantQuestion } from '../../api/assistantApi';

type ChatMessage = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: number;
};

interface AssistantChatProps {
    title?: string;
    placeholder?: string;
    onSend?: (text: string, history: ChatMessage[]) => Promise<string> | string;
    initialOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

type ChatSize = 'small' | 'medium' | 'large';

export const AssistantChat: React.FC<AssistantChatProps> = ({
                                                                title = 'Assistant',
                                                                placeholder = 'Écrire un message…',
                                                                onSend,
                                                                initialOpen = false,
                                                                open,
                                                                onOpenChange
                                                            }) => {
    const isControlled = typeof open === 'boolean';
    const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);
    const isOpen = isControlled ? !!open : uncontrolledOpen;
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [chatSize, setChatSize] = useState<ChatSize>('medium');
    const [isMobile, setIsMobile] = useState(false);
    const [loadingTick, setLoadingTick] = useState(0);
    const loadingIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 1024); // lg breakpoint
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);
    const [messages, setMessages] = useState<ChatMessage[]>(() => [
        {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'Bonjour! Comment puis-je vous aider ?',
            createdAt: Date.now()
        }
    ]);

    const scrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleToggle = () => {
        if (isControlled) {
            onOpenChange && onOpenChange(!isOpen);
        } else {
            setUncontrolledOpen(v => !v);
        }
    };


    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || isSending) return;

        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: trimmed,
            createdAt: Date.now()
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        setTimeout(() => {
            const textarea = document.querySelector('textarea[placeholder*="Écrire"]') as HTMLTextAreaElement;
            if (textarea) {
                textarea.style.height = 'auto';
            }
        }, 0);

        setIsSending(true);
        setLoadingTick(0);

        // 🔹 Compteur de loading qui s'incrémente toutes les 100ms (ou ce que tu veux)
        if (loadingIntervalRef.current == null) {
            loadingIntervalRef.current = window.setInterval(() => {
                setLoadingTick((t) => t + 1);
            }, 1000) as unknown as number; // toutes les 100ms
        }

        const abortController = new AbortController();

        try {
            let reply: string;
            if (onSend) {
                reply = await onSend(trimmed, messages.concat(userMsg));
            } else {
                const res = await sendAssistantQuestion(trimmed, abortController.signal);
                reply = res.output ?? '';
            }

            const assistantMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: reply,
                createdAt: Date.now()
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (e) {
            const assistantMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: "Désolé, une erreur s'est produite. Veuillez réessayer.",
                createdAt: Date.now()
            };
            setMessages(prev => [...prev, assistantMsg]);
        } finally {
            setIsSending(false);
            if (loadingIntervalRef.current != null) {
                window.clearInterval(loadingIntervalRef.current as unknown as number);
                loadingIntervalRef.current = null;
            }
            setLoadingTick(0);
        }
    };


    const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toggleChatSize = () => {
        setChatSize(prev => {
            const nextSize = (() => {
                switch (prev) {
                    case 'small': return 'medium';
                    case 'medium': return 'large';
                    case 'large': return 'small';
                    default: return 'medium';
                }
            })();
            console.log(`Chat size changed from ${prev} to ${nextSize}`);
            return nextSize;
        });
    };

    const getChatDimensions = () => {
        if (isMobile) {
            const dimensions = {
                width: 'calc(100vw - 2rem)',
                height: 'calc(100vh - 2rem)'
            };
            console.log('Mobile dimensions:', dimensions);
            return dimensions;
        }

        const dimensions = (() => {
            switch (chatSize) {
                case 'small':
                    return { width: '320px', height: '40vh' };
                case 'medium':
                    return { width: '380px', height: '50vh' };
                case 'large':
                    return { width: '500px', height: '70vh' };
                default:
                    return { width: '380px', height: '50vh' };
            }
        })();
        console.log(`Desktop dimensions for ${chatSize}:`, dimensions);
        return dimensions;
    };

    const getSizeIcon = () => {
        switch (chatSize) {
            case 'small':
                return <Maximize2 className="h-4 w-4" />;
            case 'medium':
                return <Maximize2 className="h-4 w-4" />;
            case 'large':
                return <Minimize2 className="h-4 w-4" />;
            default:
                return <Maximize2 className="h-4 w-4" />;
        }
    };

    return (
        <div className={`fixed z-50 ${isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'}`}>
            {!isOpen && (
                <button
                    onClick={handleToggle}
                    aria-label="Ouvrir l'assistant"
                    className={`${isMobile ? 'w-14 h-14' : 'w-12 h-12'} rounded-full shadow-lg bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                >
                    <Bot className={`${isMobile ? 'h-6 w-6' : 'h-5 w-5'}`} />
                </button>
            )}

            {isOpen && (
                <div
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${isMobile ? 'fixed inset-4' : ''} flex flex-col box-border`}
                    style={{
                        width: getChatDimensions().width,
                        maxWidth: isMobile ? 'none' : '92vw',
                        height: getChatDimensions().height
                    }}
                >
                    <CardHeader className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-primary-600" />
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {!isMobile && (
                                <button
                                    onClick={toggleChatSize}
                                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                                    aria-label="Redimensionner le chat"
                                >
                                    {getSizeIcon()}
                                </button>
                            )}
                            <button
                                onClick={handleToggle}
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                                aria-label="Fermer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </CardHeader>

                    {/* IMPORTANT: CardContent doit être flex-1 et min-h-0 pour permettre à l'enfant scrollable de shrinker correctement */}
                    <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                        {/* Messages (flex-1 sans hauteur inline) */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
                        >
                            {messages.map(m => (
                                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`px-3 py-2 rounded-lg text-sm whitespace-pre-wrap max-w-[80%] ${
                                            m.role === 'user'
                                                ? 'bg-primary-600 text-white rounded-br-none'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none'
                                        }`}
                                    >
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {isSending && (
                                <div className="flex justify-start">
                                    <div className="px-3 py-2 rounded-lg text-sm max-w-[80%] bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                                        <span>Traitement en cours… ({loadingTick}s)</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Composer fixé en bas */}
                        <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                            <div className="flex items-center gap-2 p-3">
                                <textarea
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={placeholder}
                                    rows={1}
                                    className={`flex-1 resize-none leading-relaxed ${
                                        isMobile ? 'px-4 py-3 text-base min-h-[48px]' : 'px-3 py-2 text-sm min-h-[40px]'
                                    } border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 
                                        text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500
                                        focus:border-transparent transition-all duration-200`}
                                    style={{
                                        maxHeight: isMobile ? '120px' : '100px',
                                        overflow: 'auto'
                                    }}
                                    onInput={(e) => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = 'auto';
                                        target.style.height =
                                            Math.min(target.scrollHeight, isMobile ? 120 : 100) + 'px';
                                    }}
                                />
                                <Button
                                    onClick={handleSend}
                                    disabled={isSending || !input.trim()}
                                    className={`rounded-full flex items-center justify-center shadow-md 
                                        ${isMobile ? 'w-12 h-12' : 'w-10 h-10'} 
                                        bg-primary-600 hover:bg-primary-700 text-white 
                                        disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <Send className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </div>
            )}
        </div>
    );
};

export default AssistantChat;
