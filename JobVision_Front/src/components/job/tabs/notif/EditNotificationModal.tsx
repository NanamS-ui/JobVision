import React, { useState } from 'react';
import {
    Edit3, X, Save, Loader2, Settings,
    CheckCircle2, XCircle, FileText, Power
} from 'lucide-react';
import { NotificationMyDTO } from "../../../../types/Contact.ts";
import { updateNotificationMy } from "../../../../api/contactApi.ts";
import { Button } from "../../../ui/Button.tsx";

interface Props {
    notification: NotificationMyDTO;
    onClose: () => void;
    onUpdated: () => void;
}

const EditNotificationModal: React.FC<Props> = ({ notification, onClose, onUpdated }) => {
    const [isEnabled, setIsEnabled] = useState(notification.isEnabled);
    const [attachLog, setAttachLog] = useState(notification.attachLog);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateNotificationMy(notification.id!, {
                ...notification,
                isEnabled,
                attachLog,
                updatedAt: new Date().toISOString()
            });
            onUpdated();
            onClose();
        } catch (err) {
            console.error("Update failed", err);
        } finally {
            setLoading(false);
        }
    };

    const ToggleSwitch = ({
                              checked,
                              onChange,
                              label,
                              description,
                              icon: Icon
                          }: {
        checked: boolean;
        onChange: () => void;
        label: string;
        description: string;
        icon: React.ElementType;
    }) => (
        <div className="bg-gradient-to-r from-white/80 to-emerald-50/50 dark:from-gray-700/80 dark:to-emerald-900/20 backdrop-blur-sm rounded-2xl border border-emerald-100 dark:border-emerald-800/30 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl shadow-md transition-all duration-200 ${
                        checked
                            ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                            : 'bg-gradient-to-r from-gray-400 to-gray-500'
                    }`}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {label}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                            {description}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onChange}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                        checked
                            ? 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg'
                            : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                >
                    <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                            checked ? 'translate-x-7' : 'translate-x-1'
                        }`}
                    >
                        {checked ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 m-1" />
                        ) : (
                            <XCircle className="h-4 w-4 text-gray-400 m-1" />
                        )}
                    </span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-0 duration-300">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100 dark:border-emerald-800/30 w-full max-w-2xl animate-in fade-in-0 zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                {/* En-tête */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-b border-emerald-100 dark:border-emerald-800/30 p-8 rounded-t-3xl">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                                <Edit3 className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 dark:from-emerald-400 dark:to-green-500 bg-clip-text text-transparent">
                                    Modifier la notification
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Notification #{notification.id} • Configurez vos préférences
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X className="h-6 w-6 text-gray-500 dark:text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
                        </button>
                    </div>
                </div>

                {/* Contenu */}
                <div className="p-8 space-y-8">
                    {/* Carte d'informations de notification */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                                <Settings className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Détails de la notification
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600 dark:text-gray-400">ID de préférence :</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                            {notification.contactNotificationPreferenceId || 'Aucune'}
                        </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600 dark:text-gray-400">ID du Job :</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                            {notification.jobId}
                        </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600 dark:text-gray-400">Créée le :</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                            {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600 dark:text-gray-400">Dernière mise à jour :</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                            {new Date(notification.updatedAt).toLocaleDateString()}
                        </span>
                            </div>
                        </div>
                    </div>

                    {/* Paramètres */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg">
                                <Settings className="h-5 w-5 text-white" />
                            </div>
                            Paramètres de notification
                        </h3>

                        <div className="space-y-6">
                            <ToggleSwitch
                                checked={isEnabled}
                                onChange={() => setIsEnabled(!isEnabled)}
                                label="Activer la notification"
                                description="Activez ou désactivez cette notification"
                                icon={Power}
                            />

                            <ToggleSwitch
                                checked={attachLog}
                                onChange={() => setAttachLog(!attachLog)}
                                label="Joindre les fichiers logs"
                                description="Inclure les fichiers logs avec les notifications"
                                icon={FileText}
                            />
                        </div>
                    </div>

                    {/* Résumé de la configuration actuelle */}
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700/50 dark:to-slate-700/50 border border-gray-200 dark:border-gray-600 rounded-2xl p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            Configuration actuelle
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-600/30 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-400">Statut :</span>
                                <span className={`font-semibold px-3 py-1 rounded-full text-xs ${
                                    isEnabled
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                }`}>
                            {isEnabled ? 'Activée' : 'Désactivée'}
                        </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-600/30 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-400">Logs :</span>
                                <span className={`font-semibold px-3 py-1 rounded-full text-xs ${
                                    attachLog
                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                }`}>
                            {attachLog ? 'Inclus' : 'Non inclus'}
                        </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pied de page */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700/50 dark:to-slate-700/50 border-t border-gray-200 dark:border-gray-600 p-8 rounded-b-3xl">
                    <div className="flex justify-end gap-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                            className="px-6 py-3 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 font-semibold"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    Enregistrer les modifications
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditNotificationModal;