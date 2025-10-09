import React, { createContext, useContext, useState, ReactNode } from 'react';
import PopupMessage from "./PopupMessage.tsx";

interface PopupContextType {
    showPopup: (config: PopupConfig) => void;
    hidePopup: () => void;
}

interface PopupConfig {
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
    title?: string;
    showCloseButton?: boolean;
    position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center' | 'center';
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
    animated?: boolean;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const usePopup = () => {
    const context = useContext(PopupContext);
    if (!context) {
        throw new Error('usePopup must be used within a PopupProvider');
    }
    return context;
};

interface PopupProviderProps {
    children: ReactNode;
}

export const PopupProvider: React.FC<PopupProviderProps> = ({ children }) => {
    const [popups, setPopups] = useState<Array<PopupConfig & { id: string }>>([]);

    const showPopup = (config: PopupConfig) => {
        const id = Math.random().toString(36).substr(2, 9);
        setPopups(prev => [...prev, { ...config, id }]);
    };

    const hidePopup = (id?: string) => {
        if (id) {
            setPopups(prev => prev.filter(popup => popup.id !== id));
        } else {
            setPopups([]);
        }
    };

    const removePopup = (id: string) => {
        setPopups(prev => prev.filter(popup => popup.id !== id));
    };

    return (
        <PopupContext.Provider value={{ showPopup, hidePopup }}>
            {children}
            {popups.map((popup) => (
                <PopupMessage
                    key={popup.id}
                    message={popup.message}
                    type={popup.type}
                    duration={popup.duration}
                    title={popup.title}
                    showCloseButton={popup.showCloseButton}
                    position={popup.position}
                    size={popup.size}
                    showIcon={popup.showIcon}
                    animated={popup.animated}
                    onClose={() => removePopup(popup.id)}
                />
            ))}
        </PopupContext.Provider>
    );
};