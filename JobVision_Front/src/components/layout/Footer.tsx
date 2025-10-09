import React from 'react';
import { Heart, Code, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-emerald-200/50 dark:border-emerald-700/50 px-6 py-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                    {/* Left side - Brand */}
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 rounded-lg shadow-sm">
                            <Zap className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                JobFlow
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Workflow Management System
                            </p>
                        </div>
                    </div>

                    {/* Center - Copyright */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>© {currentYear} JobFlow.</span>
                        <span className="hidden md:inline">Tous droits réservés.</span>
                    </div>

                    {/* Right side - Made with love */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="hidden sm:inline">Développé avec</span>
                        <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                        <span className="hidden sm:inline">et</span>
                        <Code className="h-4 w-4 text-blue-500" />
                        <span className="sm:hidden">Made with ❤️</span>
                    </div>
                </div>

                {/* Bottom line - Version info */}
                <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-4">
                            <span>Version 1.0.0</span>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <span>Build 2025.01</span>
                        </div>
                        <div className="flex items-center space-x-1 mt-2 sm:mt-0">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span>Système opérationnel</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};