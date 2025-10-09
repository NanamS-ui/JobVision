import React, { useEffect, useState } from 'react';
import {
    AlertCircle, X, Mail, MessageSquare, Bell,
    CheckCircle2, XCircle, User, Users, Phone,
    AtSign, Calendar, Settings, Loader2
} from 'lucide-react';
import { ContactNotificationPreferenceDTO } from '../../../../types/Contact.ts';
import { fetchNotificationPreferenceById } from '../../../../api/contactApi.ts';

interface Props {
    id: number;
    onClose: () => void;
}

const ViewPreferenceDetails: React.FC<Props> = ({ id, onClose }) => {
    const [preference, setPreference] = useState<ContactNotificationPreferenceDTO | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await fetchNotificationPreferenceById(id);
                setPreference(data);
            } catch (err) {
                console.error('Error fetching preference:', err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    const StatusBadge = ({ enabled, label }: { enabled: boolean; label: string }) => (
        <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 hover:border-emerald-200 dark:hover:border-emerald-700 transition-all duration-200">
            <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
            <div className="flex items-center gap-2">
                {enabled ? (
                    <>
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Activé</span>
                    </>
                ) : (
                    <>
                        <XCircle className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-500 dark:text-gray-400 font-semibold">Désactivé</span>
                    </>
                )}
            </div>
        </div>
    );

    const InfoCard = ({ icon: Icon, title, children, className = "" }: {
        icon: React.ElementType;
        title: string;
        children: React.ReactNode;
        className?: string;
    }) => (
        <div className={`bg-gradient-to-br from-white/80 to-emerald-50/50 dark:from-gray-800/80 dark:to-emerald-900/20 backdrop-blur-sm rounded-2xl border border-emerald-100 dark:border-emerald-800/30 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
            <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-md">
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                </div>
                {children}
            </div>
        </div>
    );

        if (loading) return ( <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600 dark:text-green-400" />
                    <span className="text-green-600 dark:text-green-400 animate-pulse">
            Chargement des données...
          </span>
                </div>
        );


    if (!preference) {
        return (
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-200 dark:border-red-800/30 max-w-md mx-auto animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="p-8 text-center">
                    <div className="p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-lg mb-6 inline-block">
                        <AlertCircle className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Préférence introuvable</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">La préférence de notification demandée n'a pas pu être chargée.</p>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100 dark:border-emerald-800/30 max-w-4xl mx-auto animate-in fade-in-0 zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            {/* En-tête */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-b border-emerald-100 dark:border-emerald-800/30 p-8 rounded-t-3xl">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                            <Settings className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 dark:from-emerald-400 dark:to-green-500 bg-clip-text text-transparent">
                                Préférences de notification
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Vue détaillée des paramètres de notification
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 group"
                    >
                        <X className="h-6 w-6 text-gray-500 dark:text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
                    </button>
                </div>
            </div>

            <div className="p-8 space-y-8">
                {/* Canaux de notification */}
                <InfoCard icon={Bell} title="Canaux de communication">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-white/70 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                            <Mail className={`h-6 w-6 ${preference.channelEmail ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`} />
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">Notifications par email</p>
                                <p className={`text-sm ${preference.channelEmail ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {preference.channelEmail ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white/70 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                            <MessageSquare className={`h-6 w-6 ${preference.channelSms ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`} />
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">Notifications SMS</p>
                                <p className={`text-sm ${preference.channelSms ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {preference.channelSms ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                        </div>
                    </div>
                </InfoCard>

                {/* Événements de notification */}
                <InfoCard icon={Bell} title="Événements de notification">
                    <div className="space-y-3">
                        <StatusBadge enabled={preference.notifyOnStart} label="Début du job" />
                        <StatusBadge enabled={preference.notifyOnFailed} label="Échec du job" />
                        <StatusBadge enabled={preference.notifyOnRecovery} label="Récupération du job" />
                        <StatusBadge enabled={preference.notifyOnSuccess} label="Succès du job" />
                    </div>
                </InfoCard>

                {/* Informations sur le groupe */}
                <InfoCard icon={Users} title="Affectation au groupe">
                    <div className="p-4 bg-white/70 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {preference.groupe?.nameGroupe || 'Aucun groupe assigné'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {preference.groupe ? 'Membre actif du groupe' : 'Préférence individuelle'}
                                </p>
                            </div>
                        </div>
                    </div>
                </InfoCard>

                {/* Informations de contact */}
                {preference.contact && (
                    <InfoCard icon={User} title="Informations de contact">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-white/70 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                                    <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Nom complet</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {preference.contact.prenom} {preference.contact.nom}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-white/70 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                                    <AtSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Adresse email</p>
                                        <p className="font-semibold text-gray-900 dark:text-white break-all">
                                            {preference.contact.email || 'Non renseigné'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-white/70 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                                    <Phone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Numéro de téléphone</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {preference.contact.telephone || 'Non renseigné'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-white/70 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                                    <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">ID de préférence</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            #{preference.id}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </InfoCard>
                )}

                {/* Bouton d'action */}
                <div className="flex justify-end pt-6 border-t border-emerald-100 dark:border-emerald-800/30">
                    <button
                        onClick={onClose}
                        className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold flex items-center gap-2"
                    >
                        <X className="h-5 w-5" />
                        Fermer les détails
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewPreferenceDetails;