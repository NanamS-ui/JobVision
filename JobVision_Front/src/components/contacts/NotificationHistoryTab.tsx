import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import {
    History,
    Mail,
    MessageSquare,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Calendar,
    RefreshCw, Loader2,
    Filter
} from 'lucide-react';
import PopupMessage from '../pop-up/PopupMessage';
import {ContactPayload, GroupeContact, NotificationLogDetails} from "../../types/Contact.ts";
import {
    fetchContacts,
    fetchFilteredLogs,
    fetchGroupeContacts,
    FilterParams
} from "../../api/contactApi.ts";
import {fetchJobs} from "../../api/jobApi.ts";
import {JobNameDTO} from "../../pages/Logs.tsx";
export const NotificationHistoryTab: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationLogDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [channelFilter, setChannelFilter] = useState('all');
    const [showPopup, setShowPopup] = useState(false);
    const [popupContent, setPopupContent] = useState<{ message: string; type: 'error' | 'info' | 'success', title?: string } | null>(null);
    const [filter, setFilter] = useState<FilterParams>({});
    const [jobs, setJobs] = useState<JobNameDTO[]>([]);
    const [groupes, setGroupes] = useState<GroupeContact[]>([]);
    const [contacts, setContacts] = useState<ContactPayload[]>([]);
    const [page, setPage] = useState<number>(0); // zero-based
    const [size] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalElements, setTotalElements] = useState<number>(0);

    useEffect(() => {
        document.title = "Notification - JobVision";
    }, []);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [jobRes, groupRes, contactRes] = await Promise.all([
                    fetchJobs(),
                    fetchGroupeContacts(),
                    fetchContacts()
                ]);
                setJobs(jobRes);
                setGroupes(groupRes);
                setContacts(contactRes);
            } catch (error) {
                console.error('Erreur lors du chargement des jobs/groupes/contacts', error);
            }
        };

        fetchAll();
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [page, size]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const pageRes = await fetchFilteredLogs({ ...filter, page, size });
            setNotifications(pageRes.content);
            setTotalPages(pageRes.totalPages);
            setTotalElements(pageRes.totalElements);
        } catch (error) {
            console.error('Failed to load notifications:', error);
            setPopupContent({
                title: "Error",
                message: "Unable to load notifications.",
                type: "error"
            });
            setShowPopup(true);
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = async () => {
        try {
            // reset à la première page lors d'un changement de filtres
            const pageRes = await fetchFilteredLogs({ ...filter, page: 0, size });
            setNotifications(pageRes.content);
            setTotalPages(pageRes.totalPages);
            setTotalElements(pageRes.totalElements);
            setPage(0);
        } catch (error) {
            console.error('Failed to fetch filtered logs', error);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'succeeded':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'onstart':
                return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
            case 'recovery':
                return <RefreshCw className="h-4 w-4 text-blue-600" />;
            default:
                return <AlertTriangle className="h-4 w-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'succeeded':
                return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
            case 'failed':
                return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
            case 'onstart':
                return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
            case 'recovery':
                return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
            default:
                return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
        }
    };

    const getChannelIcon = (channel: string) => {
        switch (channel) {
            case 'EMAIL':
                return <Mail className="h-4 w-4 text-blue-600" />;
            case 'SMS':
                return <MessageSquare className="h-4 w-4 text-green-600" />;
            default:
                return <Mail className="h-4 w-4 text-gray-600" />;
        }
    };

    const currentPage = page + 1; // UI 1-based
    const displayedNotifications = notifications; // déjà paginé côté serveur

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-green-600 dark:text-green-400" />
                <span className="text-green-600 dark:text-green-400 animate-pulse">
    Chargement des données...
  </span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {showPopup && popupContent && (
                <PopupMessage
                    type={popupContent.type}
                    title={popupContent.title}
                    message={popupContent.message}
                    onClose={() => setShowPopup(false)}
                    position="top-right"
                    duration={4000}
                />
            )}

            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                        <History className="h-6 w-6 mr-2 text-primary-600" />
                        Historique des notifications
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Voir l’historique des notifications envoyées
                    </p>
                </div>
            </div>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                            <Filter className="h-5 w-5 mr-2 text-primary-600" />
                            Options de filtrage
                        </h3>
                        <Button
                            onClick={applyFilter}
                            className="flex items-center gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            Appliquer les filtres
                        </Button>
                    </div>

                {/* Grille de filtres */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Filtre Job */}
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300">
                            Job
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <select
                                value={filter.jobId || ''}
                                onChange={e => setFilter({ ...filter, jobId: e.target.value ? Number(e.target.value) : undefined })}
                                className="block w-full pl-10 pr-3 py-2 border border-emerald-300 dark:border-emerald-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="">Tous les jobs</option>
                                {jobs.map(job => (
                                    <option key={job.jobId} value={job.jobId}>{job.jobName}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Filtre Groupe */}
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300">
                            Groupe
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
                                </svg>
                            </div>
                            <select
                                value={filter.groupeId || ''}
                                onChange={e => setFilter({ ...filter, groupeId: e.target.value ? Number(e.target.value) : undefined, contactId: undefined })}
                                className="block w-full pl-10 pr-3 py-2 border border-emerald-300 dark:border-emerald-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="">Tous les groupes</option>
                                {groupes.map(g => (
                                    <option key={g.id} value={g.id}>{g.nameGroupe}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Filtre Contact */}
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300">
                            Contact
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <select
                                value={filter.contactId || ''}
                                onChange={e => setFilter({ ...filter, contactId: e.target.value ? Number(e.target.value) : undefined, groupeId: undefined })}
                                className="block w-full pl-10 pr-3 py-2 border border-emerald-300 dark:border-emerald-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="">Tous les contacts</option>
                                {contacts.map(c => (
                                    <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Filtre Type de Notification */}
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300">
                            Type de notification
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                </svg>
                            </div>
                            <select
                                value={filter.typeNotification || ''}
                                onChange={e => setFilter({ ...filter, typeNotification: e.target.value || undefined })}
                                className="block w-full pl-10 pr-3 py-2 border border-emerald-300 dark:border-emerald-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="">Tous les types</option>
                                <option value="onstart">Au démarrage</option>
                                <option value="onfailure">Échoué</option>
                                <option value="recovery">Récupération</option>
                                <option value="onsuccess">Réussi</option>
                            </select>
                        </div>
                    </div>

                    {/* Plage de dates */}
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300">
                            Plage de dates
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    type="datetime-local"
                                    value={filter.startDate || ''}
                                    onChange={e => setFilter({ ...filter, startDate: e.target.value || undefined })}
                                    className="block w-full pl-10 pr-3 py-2 border border-emerald-300 dark:border-emerald-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    type="datetime-local"
                                    value={filter.endDate || ''}
                                    onChange={e => setFilter({ ...filter, endDate: e.target.value || undefined })}
                                    className="block w-full pl-10 pr-3 py-2 border border-emerald-300 dark:border-emerald-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
            </Card>

            {/* En-tête ou compteur */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Historique des notifications ({totalElements})
                </h3>
            </div>

            {/* Contrôles de pagination - Haut (comme HistoryTabs) */}
            {totalElements > size && (
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Affichage de {Math.min(currentPage * size, totalElements)} sur {totalElements} notifications
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(p - 1, 0))}
                            disabled={page === 0}
                        >
                            Précédent
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(p + 1, Math.max(totalPages - 1, 0)))}
                            disabled={currentPage >= totalPages}
                        >
                            Suivant
                        </Button>
                    </div>
                </div>
            )}

            {/* Liste des notifications */}
            <Card>
                <CardContent className="p-0">
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {displayedNotifications.map((notification, index) => (
                            <div
                                key={notification.idLogNotification || index}
                                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4 flex-1">
                                        <div className="flex-shrink-0">
                                            {getStatusIcon(notification.statusJob || '')}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(notification.statusJob || '')}`}>
                      {notification.statusJob}
                    </span>
                                                <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full">
                      {getChannelIcon(notification.channel || '')}
                                                    <span className="ml-1">{notification.channel}</span>
                    </span>
                                                {notification.idJob && (
                                                    <span className="text-xs text-gray-500">
                        Job #{notification.idJob}
                      </span>
                                                )}
                                            </div>
                                            <p
                                                className="text-sm text-gray-900 dark:text-gray-100 mb-1"
                                                dangerouslySetInnerHTML={{ __html: notification.message || '' }}
                                            ></p>
                                            <div className="flex flex-col text-xs text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {notification.sentAt
                                                        ? new Date(notification.sentAt).toLocaleString()
                                                        : 'Heure inconnue'}
                                                </div>

                                                {notification.groupeName ? (
                                                    <div className="mt-1">
                                                        Groupe : <span className="font-medium text-gray-700 dark:text-gray-200">{notification.groupeName}</span>
                                                    </div>
                                                ) : notification.contactNom ? (
                                                    <div className="mt-1">
                                                        Contact : <span className="font-medium text-gray-700 dark:text-gray-200">{notification.contactNom}</span>
                                                        {notification.contactEmail && (
                                                            <span className="ml-1 text-gray-400">({notification.contactEmail})</span>
                                                        )}
                                                    </div>
                                                ) : null}
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Contrôles de pagination - Bas (comme HistoryTabs) */}
            {totalElements > size && (
                <div className="flex justify-center items-center gap-4 pt-4">
                    <Button
                        variant="ghost"
                        onClick={() => setPage(0)}
                        disabled={page === 0}
                    >
                        Premier
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setPage(p => Math.max(p - 1, 0))}
                        disabled={page === 0}
                    >
                        Précédent
                    </Button>
                    <span className="text-sm font-medium">
                        Page {currentPage} sur {Math.max(totalPages, 1)}
                    </span>
                    <Button
                        variant="ghost"
                        onClick={() => setPage(p => Math.min(p + 1, Math.max(totalPages - 1, 0)))}
                        disabled={currentPage >= totalPages}
                    >
                        Suivant
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setPage(Math.max(totalPages - 1, 0))}
                        disabled={currentPage >= totalPages}
                    >
                        Dernier
                    </Button>
                </div>
            )}

            {notifications.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Aucune notification trouvée
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {searchTerm || statusFilter !== 'all' || channelFilter !== 'all'
                                ? 'Aucune notification ne correspond à vos filtres actuels.'
                                : "Aucune notification n'a encore été envoyée."}
                        </p>
                        {(searchTerm || statusFilter !== 'all' || channelFilter !== 'all') && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('all');
                                    setChannelFilter('all');
                                }}
                            >
                                Réinitialiser les filtres
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>

    );
};