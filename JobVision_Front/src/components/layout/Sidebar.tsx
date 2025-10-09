import React, {useEffect, useState} from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    Settings,
    FolderOpen,
    Play,
    Key,
    Server,
    FileText,
    Terminal,
    ChevronDown,
    Plus,
    List,
    TrendingUp,
    Home,
    Users,
    X,
    Bell,
    Shield
} from 'lucide-react';
import {UserAuthDTO} from "../../types/UserAuthDTO.ts";
import {getUserProfile} from "../../api/authApi.ts";

type NavigationItem = {
    name: string;
    href?: string;
    icon: React.ElementType;
    hasDropdown?: boolean;
    badge?: string;
    subItems?: {
        name: string;
        href: string;
        icon: React.ElementType;
        badge?: string;
    }[];
};

type NavigationSection = {
    title: string;
    items: NavigationItem[];
};

const navigationSections: NavigationSection[] = [
    {
        title: 'Tableau de bord',
        items: [
            { name: 'Vue d\'ensemble', href: '/', icon: Home },
            { name: 'Services', href: '/services', icon: Settings },
            { name: 'Projets', href: '/projects', icon: FolderOpen },
        ]
    },
    {
        title: 'Gestion des tâches',
        items: [
            {
                name: 'Jobs & Workflows',
                icon: Play,
                hasDropdown: true,
                subItems: [
                    { name: 'Créer un job', href: '/jobs/create', icon: Plus },
                    { name: 'Liste des jobs', href: '/jobs/list', icon: List },
                    { name: 'Statistiques', href: '/jobs/statistics', icon: TrendingUp },
                ]
            },
            { name: 'Terminal & Commandes', href: '/commands', icon: Terminal },
            { name: 'Logs', href: '/logs', icon: FileText },
        ]
    },
    {
        title: 'Administration',
        items: [
            { name: 'Clés SSH', href: '/keys', icon: Key },
            { name: 'Nœuds', href: '/nodes', icon: Server},
            { name: 'Équipe & Contacts', href: '/contacts', icon: Users },
            { name: 'Notifications', href: '/notifications', icon: Bell},
        ]
    }
];

interface SidebarProps {
    onLinkClick?: () => void;
    onToggleChat?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLinkClick }) => {
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const location = useLocation();
    const [user, setUser] = useState<UserAuthDTO | null>(null);
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        getUserProfile().then(setUser).catch(console.error);
    }, []);

    const toggleExpanded = (itemName: string) => {
        setExpandedItems(prev =>
            prev.includes(itemName)
                ? prev.filter(name => name !== itemName)
                : [...prev, itemName]
        );
    };

    const isExpanded = (itemName: string) => expandedItems.includes(itemName);

    const isSubItemActive = (subItems: any[]) =>
        subItems.some((subItem) => location.pathname.startsWith(subItem.href));

    const handleLinkClick = () => {
        if (onLinkClick) {
            onLinkClick();
        }
    };

    // Filtrage dynamique des sections/items selon la recherche
    const filteredSections = navigationSections
        .map(section => {
            // Filtrer les items de la section selon la recherche
            const filteredItems = section.items.filter(item => {
                const search = searchValue.toLowerCase();
                // Vérifie le titre de la section, le nom de l'item, et le nom des sous-items
                const itemMatch = item.name.toLowerCase().includes(search);
                const sectionMatch = section.title.toLowerCase().includes(search);
                const subItemMatch = item.subItems && item.subItems.some(sub => sub.name.toLowerCase().includes(search));
                return sectionMatch || itemMatch || subItemMatch;
            });
            // Si la recherche correspond au titre de la section, on garde tous les items
            if (section.title.toLowerCase().includes(searchValue.toLowerCase()) && searchValue.length > 0) {
                return { ...section };
            }
            return { ...section, items: filteredItems };
        })
        // On ne garde que les sections qui ont au moins un item après filtrage
        .filter(section => section.items.length > 0 || section.title.toLowerCase().includes(searchValue.toLowerCase()));

    return (
        <div className="flex flex-col w-72 sm:w-80 lg:w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/60 dark:border-gray-800/60 shadow-xl h-full relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/30 via-transparent to-green-50/20 dark:from-emerald-950/20 dark:via-transparent dark:to-green-950/10 pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-center justify-between px-6 py-6 border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl mb-4 shadow-lg animate-pulse-glow relative">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                viewBox="0 0 24 24"
                                className="animate-float"
                            >
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                            </svg>
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-xl blur-md opacity-50 animate-pulse"></div>
                        </div>
                    </div>
                    <div>
                        <span className="text-xl font-bold bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-800 dark:from-emerald-100 dark:via-emerald-200 dark:to-green-200 bg-clip-text text-transparent">
                            JobVision
                        </span>
                        <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-medium flex items-center space-x-1">
                            <Shield className="h-3 w-3" />
                            <span>Workflow Management</span>
                        </p>
                    </div>
                </div>

                {/* Bouton fermer pour mobile */}
                <button
                    onClick={onLinkClick}
                    className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 transition-all duration-200 hover:scale-105"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Barre de recherche */}
            <div className="px-6 py-3 border-b border-gray-200/40 dark:border-gray-800/40 bg-white/80 dark:bg-gray-900/80">
                <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                />
            </div>

            {/* Navigation */}
            <nav className="relative flex-1 px-4 py-6 space-y-8 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-200 dark:scrollbar-thumb-emerald-800 scrollbar-track-transparent">
                {filteredSections.map((section) => (
                    <div key={section.title} className="space-y-4">
                        {/* Section Title */}
                        <div className="flex items-center px-2">
                            <h3 className="text-xs font-bold text-emerald-800/80 dark:text-emerald-300/80 uppercase tracking-wider flex-shrink-0">
                                {section.title}
                            </h3>
                            <div className="flex-1 ml-4 h-px bg-gradient-to-r from-emerald-200/60 via-emerald-300/40 to-transparent dark:from-emerald-700/60 dark:via-emerald-600/40"></div>
                        </div>

                        {/* Section Items */}
                        <div className="space-y-1.5">
                            {section.items.map((item) => (
                                <div key={item.name}>
                                    {item.hasDropdown && item.subItems ? (
                                        <>
                                            <div className="flex items-center w-full">
                                                <button
                                                    onClick={() => toggleExpanded(item.name)}
                                                    className={`flex items-center flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 group relative overflow-hidden ${
                                                        isSubItemActive(item.subItems)
                                                            ? 'bg-gradient-to-r from-emerald-100 via-emerald-50 to-green-100 dark:from-emerald-900/40 dark:via-emerald-800/30 dark:to-green-900/40 text-emerald-800 dark:text-emerald-200 shadow-lg shadow-emerald-500/10 border border-emerald-200/50 dark:border-emerald-700/50'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100/80 hover:to-gray-50/80 dark:hover:from-gray-800/50 dark:hover:to-gray-700/30 hover:text-gray-900 dark:hover:text-gray-100 hover:shadow-md hover:shadow-gray-500/5'
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-3 flex-1">
                                                        <div className={`p-2 rounded-lg transition-all duration-300 ${
                                                            isSubItemActive(item.subItems)
                                                                ? 'bg-emerald-200/50 dark:bg-emerald-800/50'
                                                                : 'bg-gray-200/50 dark:bg-gray-700/50 group-hover:bg-gray-300/50 dark:group-hover:bg-gray-600/50'
                                                        }`}>
                                                            <item.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                                                        </div>
                                                        <span className="flex-1 text-left">{item.name}</span>
                                                        {item.badge && (
                                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                                                isSubItemActive(item.subItems)
                                                                    ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200'
                                                                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                            }`}>
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className={`p-1.5 rounded-lg ml-2 transition-all duration-300 ${
                                                        isExpanded(item.name) ? 'rotate-180' : ''
                                                    } ${
                                                        isSubItemActive(item.subItems)
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                        <ChevronDown className="h-4 w-4" />
                                                    </div>
                                                </button>
                                            </div>

                                            {/* Dropdown Items */}
                                            <div
                                                className={`ml-6 overflow-hidden transition-all duration-500 ease-out ${
                                                    isExpanded(item.name) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                                }`}
                                            >
                                                <div className="mt-2 space-y-1 border-l-2 border-emerald-200/60 dark:border-emerald-700/60 pl-6 relative">
                                                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-300/60 to-transparent dark:from-emerald-600/60"></div>
                                                    {item.subItems.map((subItem, index) => (
                                                        <NavLink
                                                            key={subItem.name}
                                                            to={subItem.href}
                                                            onClick={handleLinkClick}
                                                            className={({ isActive }) =>
                                                                `flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden ${
                                                                    isActive
                                                                        ? 'bg-gradient-to-r from-emerald-50 via-emerald-25 to-green-50 dark:from-emerald-900/30 dark:via-emerald-800/20 dark:to-green-900/30 text-emerald-700 dark:text-emerald-300 shadow-md shadow-emerald-500/10 border-l-4 border-emerald-500 dark:border-emerald-400'
                                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-gray-25/80 dark:hover:from-gray-800/30 dark:hover:to-gray-700/20 hover:text-gray-800 dark:hover:text-gray-200 hover:shadow-sm'
                                                                }`
                                                            }
                                                            style={{ animationDelay: `${index * 50}ms` }}
                                                        >
                                                            <div className="flex items-center space-x-3 flex-1">
                                                                <div className="p-1.5 rounded-lg bg-gray-200/40 dark:bg-gray-700/40 group-hover:bg-gray-300/50 dark:group-hover:bg-gray-600/50 transition-all duration-300">
                                                                    <subItem.icon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110" />
                                                                </div>
                                                                <span className="flex-1">{subItem.name}</span>
                                                                {subItem.badge && (
                                                                    <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300 rounded-full">
                                                                        {subItem.badge}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </NavLink>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    ) : item.href ? (
                                        <NavLink
                                            to={item.href}
                                            onClick={handleLinkClick}
                                            className={({ isActive }) =>
                                                `flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 group relative overflow-hidden ${
                                                    isActive
                                                        ? 'bg-gradient-to-r from-emerald-100 via-emerald-50 to-green-100 dark:from-emerald-900/40 dark:via-emerald-800/30 dark:to-green-900/40 text-emerald-800 dark:text-emerald-200 shadow-lg shadow-emerald-500/10 border border-emerald-200/50 dark:border-emerald-700/50'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100/80 hover:to-gray-50/80 dark:hover:from-gray-800/50 dark:hover:to-gray-700/30 hover:text-gray-900 dark:hover:text-gray-100 hover:shadow-md hover:shadow-gray-500/5'
                                                }`
                                            }
                                        >
                                            <div className="flex items-center space-x-3 flex-1">
                                                <div className={`p-2 rounded-lg transition-all duration-300 ${
                                                    location.pathname === item.href
                                                        ? 'bg-emerald-200/50 dark:bg-emerald-800/50'
                                                        : 'bg-gray-200/50 dark:bg-gray-700/50 group-hover:bg-gray-300/50 dark:group-hover:bg-gray-600/50'
                                                }`}>
                                                    <item.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                                                </div>
                                                <span className="flex-1">{item.name}</span>
                                                {item.badge && (
                                                    <span className={`px-2 py-1 text-xs font-bold rounded-full transition-all duration-300 ${
                                                        location.pathname === item.href
                                                            ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200'
                                                            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 group-hover:bg-gray-300 dark:group-hover:bg-gray-600'
                                                    }`}>
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </div>
                                        </NavLink>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer moderne avec assistant */}
            <div className="relative px-6 py-6 border-t border-primary-200/30 dark:border-primary-800/30 bg-gradient-to-r from-primary-50/50 via-white/30 to-secondary-50/50 dark:from-primary-800/30 dark:via-slate-900/30 dark:to-secondary-800/30">
                {/* Assistant IA - Design moderne */}
                {/*<div className="mb-4">*/}
                {/*    <button*/}
                {/*        onClick={onToggleChat}*/}
                {/*        className="group relative w-full p-4 rounded-2xl bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 hover:from-primary-600 hover:via-secondary-600 hover:to-accent-600 text-white shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"*/}
                {/*        aria-label="Ouvrir l'assistant IA"*/}
                {/*        title="Assistant IA - Cliquez pour ouvrir le chat"*/}
                {/*    >*/}
                {/*        /!* Effet de brillance animé *!/*/}
                {/*        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>*/}

                {/*        /!* Contenu du bouton *!/*/}
                {/*        <div className="relative z-10 flex items-center justify-between">*/}
                {/*            <div className="flex items-center space-x-3">*/}
                {/*                <div className="relative">*/}
                {/*                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">*/}
                {/*                        <Bot className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />*/}
                {/*                    </div>*/}
                {/*                    /!* Indicateur de disponibilité *!/*/}
                {/*                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-400 rounded-full shadow-lg shadow-accent-400/50 animate-pulse border-2 border-white"></div>*/}
                {/*                </div>*/}
                {/*                <div className="text-left">*/}
                {/*                    <p className="font-semibold text-sm">Assistant IA</p>*/}
                {/*                </div>*/}
                {/*            </div>*/}

                {/*            /!* Icône d'action *!/*/}
                {/*            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30 group-hover:bg-white/30 transition-all duration-300">*/}
                {/*                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
                {/*                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />*/}
                {/*                </svg>*/}
                {/*            </div>*/}
                {/*        </div>*/}

                {/*        /!* Effet de particules au clic *!/*/}
                {/*        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-400/0 via-white/20 to-accent-400/0 opacity-0 group-active:opacity-100 transition-opacity duration-150"></div>*/}
                {/*    </button>*/}
                {/*</div>*/}

                {/* Informations système et utilisateur */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary-500 rounded-full shadow-sm shadow-primary-500/50 animate-pulse"></div>
                        <span className="text-xs font-medium text-primary-600 dark:text-primary-400">Système en ligne</span>
                    </div>

                    {/* Badge utilisateur moderne */}
                    <div className="flex items-center space-x-2 px-3 py-2 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-primary-200/60 dark:border-primary-700/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="w-2 h-2 bg-secondary-500 rounded-full shadow-sm shadow-secondary-500/50"></div>
                        <span className="text-xs font-mono font-semibold text-primary-700 dark:text-primary-300">
                            {user?.matricule || "..."}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};