import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
// import AssistantChat from '../ui/AssistantChat';

export const Layout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    // const [chatOpen, setChatOpen] = useState(false);

    // Détecter si on est sur mobile
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 1024); // lg breakpoint
            if (window.innerWidth >= 1024) {
                setSidebarOpen(false); // Fermer la sidebar sur desktop
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Fermer la sidebar quand on clique sur un lien (mobile uniquement)
    const closeSidebar = () => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar pour desktop - toujours visible */}
            <div className="hidden lg:flex">
                <Sidebar onLinkClick={closeSidebar}  />
            </div>

            {/* Sidebar mobile - avec overlay */}
            {isMobile && (
                <>
                    {/* Overlay */}
                    <div
                        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${
                            sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                    />

                    {/* Sidebar mobile */}
                    <div
                        className={`fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
                            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                    >
                        <Sidebar onLinkClick={closeSidebar}  />
                    </div>
                </>
            )}

            {/* Contenu principal */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                    showMenuButton={isMobile}
                />
                <main className="flex-1 overflow-auto p-4 sm:p-6">
                    <div className="animate-fade-in space-y-4">
                        <Outlet />
                    </div>
                </main>
                {/*<AssistantChat open={chatOpen} onOpenChange={setChatOpen} />*/}
            </div>
        </div>
    );
};