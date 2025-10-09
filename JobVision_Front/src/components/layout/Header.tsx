import React, {useEffect, useState} from 'react';
import {LogOut, Moon, Sun, UserCog, Menu} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/Button';
import { useNavigate } from "react-router-dom";
import {logout} from "../../api/loginApi.ts";
import {UserAuthDTO} from "../../types/UserAuthDTO.ts";
import {getUserProfile} from "../../api/authApi.ts";

interface HeaderProps {
    onMenuClick?: () => void;
    showMenuButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({onMenuClick, showMenuButton }) => {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const [user, setUser] = useState<UserAuthDTO | null>(null);

    useEffect(() => {
        getUserProfile().then(setUser).catch(console.error);
    }, []);

    const handleLogout = async () => {
        try {
            if (logout) {
                await logout();
            }
            localStorage.removeItem('jwt');
            navigate('/login');
        } catch (error) {
            console.error('Erreur lors de la déconnexion', error);
        }
    };

    return (
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-emerald-200/50 dark:border-emerald-700/50 px-4 sm:px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
                {/* Left Side - Menu button + Title */}
                <div className="flex items-center space-x-3 flex-1">
                    {/* Menu hamburger pour mobile */}
                    {showMenuButton && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onMenuClick}
                            className="lg:hidden p-2"
                            title="Ouvrir le menu"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    )}
                    {/* Page Title */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg sm:text-xl font-semibold text-emerald-900 dark:text-emerald-100 truncate">
                            Supervision des Jobs
                        </h1>
                        <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 hidden sm:block">
                            Suivi et contrôle en temps réel
                        </p>
                    </div>
                </div>
                {/* Right Side Actions */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleTheme}
                        className="p-2 sm:p-2.5 hover:rotate-12 transition-transform duration-200"
                        title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
                    >
                        {theme === 'light' ? (
                            <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                            <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                    </Button>
                    {/* User Menu */}
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-2 p-2 sm:p-2.5"
                        >
                            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
                                <UserCog className="h-5 w-5 text-white" />
                            </div>
                        </Button>
                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-200/60 dark:border-emerald-800/60 py-2 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
                                <div className="px-5 py-4 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                                        <UserCog className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                            {user?.name || "..."}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {user?.email || "..."}
                                        </div>
                                        {user?.matricule && (
                                            <div className="text-xs text-emerald-700 dark:text-emerald-300 font-mono mt-1">Matricule : {user.matricule}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="py-2 border-t border-gray-200/50 dark:border-gray-700/50">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center px-5 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/20 transition-colors duration-150 group rounded-xl"
                                    >
                                        <LogOut className="h-4 w-4 mr-3 group-hover:translate-x-0.5 transition-transform duration-150" />
                                        Se déconnecter
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Click outside to close menu */}
            {showUserMenu && (
                <div
                    className="fixed inset-0 z-40 animate-fade-out"
                    onClick={() => setShowUserMenu(false)}
                ></div>
            )}
        </header>
    );
};