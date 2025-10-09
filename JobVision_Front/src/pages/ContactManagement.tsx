import React, {useEffect, useState} from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { GroupeContactsTab } from '../components/contacts/GroupeContactsTab';
import { ContactsTab } from '../components/contacts/ContactsTab';
import { PreferencesTab } from '../components/contacts/PreferencesTab';
import { Users, User, Settings } from 'lucide-react';

export const ContactManagement: React.FC = () => {
    useEffect(() => {
        document.title = "Contacts - JobVision";
    }, []);
    const [activeTab, setActiveTab] = useState('groups');

    const tabs = [
        {
            id: 'groups',
            label: 'Groupes de contacts',
            icon: Users,
            component: GroupeContactsTab
        },
        {
            id: 'contacts',
            label: 'Contacts',
            icon: User,
            component: ContactsTab
        },
        {
            id: 'preferences',
            label: 'Préférences',
            icon: Settings,
            component: PreferencesTab
        }
        ];

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || GroupeContactsTab;

    return (
        <div className="space-y-6">
            {/* En-tête de la page */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Gestion des contacts
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gérez les contacts, les groupes et les préférences de notification
                    </p>
                </div>
            </div>

            {/* Navigation des onglets */}
            <Card>
                <CardHeader className="pb-0">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === tab.id
                                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                        }`}
                                    >
                                        <Icon className="h-5 w-5 mr-2" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <ActiveComponent />
                </CardContent>
            </Card>
        </div>

    );
};