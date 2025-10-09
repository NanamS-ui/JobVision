import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import {
    Bell, Plus, Eye, Mail,
    AlertCircle, CheckCircle2, XCircle, ChevronDown, Pencil, Trash2
} from 'lucide-react';
import {
    deleteNotification,
    fetchAvailableContactsForJob, fetchAvailableGroupesForJob,
    fetchNotificationPreference,
    fetchNotificationsByJobId, saveNotifications,
} from '../../../api/contactApi';
import {ContactDTO, ContactNotificationPreferenceDTO, GroupeDTO, NotificationMyDTO} from '../../../types/Contact.ts';
import {Button} from "../../ui/Button.tsx";
import ViewPreferenceDetails from "./notif/ViewPreferenceDetails.tsx";
import EditNotificationModal from "./notif/EditNotificationModal.tsx";
import PopupMessage from "../../pop-up/PopupMessage.tsx";

export const Notification: React.FC<{ jobId: number; isActive: boolean }> = ({ jobId, isActive }) => {
    const [notifications, setNotifications] = useState<NotificationMyDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});
    const [selectedPreferenceId, setSelectedPreferenceId] = useState<number | null>(null);
    const [editingNotification, setEditingNotification] = useState<NotificationMyDTO | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [groupes, setGroupes] = useState<GroupeDTO[]>([]);
    const [contacts, setContacts] = useState<ContactDTO[]>([]);
    const [targetGrp, setTargetGrp] = useState<number | ''>('');
    const [targetContact, setTargetContact] = useState<number | ''>('');
    const [pref, setPref] = useState<ContactNotificationPreferenceDTO | null>(null);
    const [popup, setPopup] = useState<{
        message: string;
        type: 'success' | 'error' | 'info' | 'warning';
    } | null>(null);
    const [targetType, setTargetType] = useState<"groupe" | "contact" | "">("");

    const [formData, setFormData] = useState<NotificationMyDTO>({
        id: 0,
        isEnabled: true,
        attachLog: false,
        contactNotificationPreferenceId: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        jobId
    });

    useEffect(() => {
        if (isActive) {
            loadNotifications();
            fetchAvailableGroupesForJob(jobId).then(setGroupes);
            fetchAvailableContactsForJob(jobId).then(setContacts);
        }
    }, [jobId, isActive]);

    // quand on change de cible, on récupère la préférence
    useEffect(() => {
        const loadPref = async () => {
            if (targetGrp || targetContact) {
                const dto = await fetchNotificationPreference(
                    targetGrp ? Number(targetGrp) : undefined,
                    targetContact ? Number(targetContact) : undefined
                );
                setPref(dto);
                if (dto) {
                    setFormData(fd => ({
                        ...fd,
                        contactNotificationPreferenceId: dto.id!
                    }));
                }
            } else {
                setPref(null);
            }
        };
        loadPref();
    }, [targetGrp, targetContact]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pref) {
            setPopup({ message: 'Veuillez sélectionner un groupe ou un contact avec une préférence existante.', type: 'error' });
            return;
        }
        try {
            const now = new Date().toISOString();
            const dto: NotificationMyDTO = {
                ...formData,
                createdAt: now,
                updatedAt: now
            };
            await saveNotifications([dto]);
            console.log(dto);
            setPopup({ message: 'Notification enregistrée avec succès!', type: 'success' });
            loadNotifications();
            setShowForm(false);
        } catch (err) {
            console.error(err);
            setPopup({ message: 'Échec de l\'enregistrement de la notification.', type: 'error' });
        }
    };

    const handleDelete = async (notificationId: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
            try {
                // Appel API pour supprimer la notification
                await deleteNotification(notificationId);
                
                // Mise à jour locale
                setNotifications(prev => prev.filter(n => n.id !== notificationId));
                setPopup({ message: 'Notification supprimée avec succès!', type: 'success' });
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                setPopup({ message: 'Échec de la suppression de la notification.', type: 'error' });
            }
        }
    };

    const handleView = (id: number | null) => {
        if (id) setSelectedPreferenceId(id);
    };

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await fetchNotificationsByJobId(jobId);
            setNotifications(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCardExpand = (id: number) => {
        setExpandedCards((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    useEffect(() => {
        if (isActive) {
            loadNotifications();
        }
    }, [jobId, isActive]);

    const getStatusIcon = (status: boolean) => {
        return status ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
        ) : (
            <XCircle className="h-5 w-5 text-red-500" />
        );
    };

    return (
        <div className="space-y-4 p-4">
            {popup && (
                <PopupMessage
                    message={popup.message}
                    type={popup.type}
                    onClose={() => setPopup(null)}
                    position="top-center"
                    animated
                />
            )}
            {selectedPreferenceId && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                    <ViewPreferenceDetails
                        id={selectedPreferenceId}
                        onClose={() => setSelectedPreferenceId(null)}
                    />
                </div>
            )}

            {editingNotification && (
                <EditNotificationModal
                    notification={editingNotification}
                    onClose={() => setEditingNotification(null)}
                    onUpdated={loadNotifications}
                />
            )}

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Bell className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications de Job</h2>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setShowForm(true)} disabled={loading}>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une notification
                    </Button>
                </div>
            </div>

            {/* Formulaire en ligne */}
            {showForm && (
                <form onSubmit={handleSubmit}>
                    <Card className="mb-4">
                        <CardHeader className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {pref ? 'Modifier la préférence de notification' : 'Ajouter une préférence de notification'}
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowForm(false)}
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                                Annuler
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Choix de la cible */}
                            <div className="space-y-4">
                                {/* Checkbox pour choisir le type de cible */}
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={targetType === "groupe"}
                                            onChange={() => {
                                                setTargetType("groupe");
                                                setTargetContact('');
                                            }}
                                        />
                                        Groupe
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={targetType === "contact"}
                                            onChange={() => {
                                                setTargetType("contact");
                                                setTargetGrp('');
                                            }}
                                        />
                                        Contact
                                    </label>
                                </div>

                                {/* Selecteur en fonction du choix */}
                                {targetType === "groupe" && (
                                    <select
                                        value={targetGrp}
                                        onChange={e => {
                                            setTargetGrp(e.target.value as any);
                                            setTargetContact('');
                                        }}
                                        className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700"
                                    >
                                        <option value="">Sélectionner un groupe</option>
                                        {groupes.map(g => (
                                            <option key={g.id} value={g.id}>{g.nameGroupe}</option>
                                        ))}
                                    </select>
                                )}

                                {targetType === "contact" && (
                                    <select
                                        value={targetContact}
                                        onChange={e => {
                                            setTargetContact(e.target.value as any);
                                            setTargetGrp('');
                                        }}
                                        className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700"
                                    >
                                        <option value="">Sélectionner un contact</option>
                                        {contacts.map(c => (
                                            <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Affichage des préférences récupérées */}
                            {pref && (
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded text-sm text-gray-700 dark:text-gray-300">
                                    <div>
                                        <p><strong>Au démarrage :</strong> {pref.notifyOnStart ? 'Oui' : 'Non'}</p>
                                        <p><strong>En cas d’échec :</strong> {pref.notifyOnFailed ? 'Oui' : 'Non'}</p>
                                        <p><strong>Lors de la récupération :</strong> {pref.notifyOnRecovery ? 'Oui' : 'Non'}</p>
                                    </div>
                                    <div>
                                        <p><strong>En cas de succès :</strong> {pref.notifyOnSuccess ? 'Oui' : 'Non'}</p>
                                        <p><strong>Email :</strong> {pref.channelEmail ? 'Oui' : 'Non'}</p>
                                        <p><strong>SMS :</strong> {pref.channelSms ? 'Oui' : 'Non'}</p>
                                    </div>
                                </div>
                            )}


                            {targetType && (
                                <>
                                    {/* Options de notification */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.attachLog}
                                                onChange={e => setFormData(fd => ({ ...fd, attachLog: e.target.checked }))}
                                                className="mr-2"
                                            />
                                            Joindre le journal (log)
                                        </label>
                                    </div>

                                    {/* Boutons */}
                                    <div className="flex justify-end gap-2">
                                        <Button type="submit" variant="primary">Enregistrer</Button>
                                        <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </form>
            )}

            {/* Liste des notifications */}
            <Card>
                <CardContent className="p-0">
                    {notifications.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Aucune notification trouvée
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Aucune notification n'a été configurée pour ce job.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4 flex-1">
                                            <div className="flex-shrink-0">
                                                {getStatusIcon(notif.isEnabled)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                                                        notif.isEnabled 
                                                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                                                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                                    }`}>
                                                        {notif.isEnabled ? 'Activée' : 'Désactivée'}
                                                    </span>
                                                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                                                        <Mail className="h-3 w-3 mr-1" />
                                                        Notification #{notif.id}
                                                    </span>
                                                    {notif.attachLog && (
                                                        <span className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                                                            Logs joints
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                    <div>
                                                        <p><span className="font-medium">Préférence ID:</span> {notif.contactNotificationPreferenceId ?? 'Aucune'}</p>
                                                        <p><span className="font-medium">Créée le:</span> {new Date(notif.createdAt).toLocaleDateString('fr-FR')}</p>
                                                    </div>
                                                    <div>
                                                        <p><span className="font-medium">Modifiée le:</span> {new Date(notif.updatedAt).toLocaleDateString('fr-FR')}</p>
                                                        <p><span className="font-medium">Journaux:</span> {notif.attachLog ? 'Inclus' : 'Non inclus'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 ml-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                onClick={() => handleView(notif.contactNotificationPreferenceId)}
                                            >
                                                <Eye className="h-4 w-4" />
                                                <span className="hidden sm:inline">Voir</span>
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                                onClick={() => setEditingNotification(notif)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                                <span className="hidden sm:inline">Modifier</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                onClick={() => handleDelete(notif.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="hidden sm:inline">Supprimer</span>
                                            </Button>
                                            <button
                                                onClick={() => toggleCardExpand(notif.id)}
                                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <ChevronDown
                                                    className={`h-4 w-4 transition-transform ${expandedCards[notif.id] ? 'rotate-180' : ''}`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    {expandedCards[notif.id] && (
                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Détails de la notification</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">Statut:</span>
                                                            <span className="font-medium">{notif.isEnabled ? 'Activée' : 'Désactivée'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">Journaux joints:</span>
                                                            <span className="font-medium">{notif.attachLog ? 'Oui' : 'Non'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">ID Préférence:</span>
                                                            <span className="font-medium">{notif.contactNotificationPreferenceId ?? 'Aucune'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">Créée le:</span>
                                                            <span className="font-medium">{new Date(notif.createdAt).toLocaleString('fr-FR')}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">Modifiée le:</span>
                                                            <span className="font-medium">{new Date(notif.updatedAt).toLocaleString('fr-FR')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

    );
};
