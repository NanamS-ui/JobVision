import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import {ContactNotificationPreference, GroupeContact, ContactPayload} from '../../types/Contact';
import {
    fetchNotificationPreferences,
    createNotificationPreference,
    updateNotificationPreference,
    deleteNotificationPreference,
    fetchContactsNoPreference, fetchGroupeContactsNoPreference
} from '../../api/contactApi';
import {
    Plus,
    Edit,
    Trash2,
    Settings,
    Search,
    Mail,
    MessageSquare,
    CheckCircle,
    XCircle,
    AlertTriangle,
    PlayCircle, Loader2
} from 'lucide-react';
import PopupMessage from '../pop-up/PopupMessage';

export const PreferencesTab: React.FC = () => {
    const [preferences, setPreferences] = useState<ContactNotificationPreference[]>([]);
    const [filteredPreferences, setFilteredPreferences] = useState<ContactNotificationPreference[]>([]);
    const [groupes, setGroupes] = useState<GroupeContact[]>([]);
    const [contacts, setContacts] = useState<ContactPayload[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPreference, setEditingPreference] = useState<ContactNotificationPreference | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        notifyOnFailed: false,
        notifyOnRecovery: false,
        notifyOnSuccess: false,
        notifyOnStart: false,
        channelEmail: true,
        channelSms: false,
        id_group_contact: '',
        id_contact: '',
        groupe: { id_group_contact: '' },
        contact: { id_contact: '' }
    });

    const [showPopup, setShowPopup] = useState(false);
    const [popupContent, setPopupContent] = useState<{ message: string; type: 'error' | 'info' | 'success', title?: string } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const filtered = preferences.filter(pref => {
            const groupName = pref.groupe?.nameGroupe || '';
            const contactName = pref.contact ? `${pref.contact.prenom} ${pref.contact.nom}` : '';
            return groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contactName.toLowerCase().includes(searchTerm.toLowerCase());
        });
        setFilteredPreferences(filtered);
    }, [preferences, searchTerm]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [preferencesData, groupesData, contactsData] = await Promise.all([
                fetchNotificationPreferences(),
                fetchGroupeContactsNoPreference(),
                fetchContactsNoPreference()
            ]);

            setPreferences(preferencesData);
            setGroupes(groupesData);
            setContacts(contactsData);

            const newPreferencesData = await fetchNotificationPreferences();
            setPreferences(newPreferencesData);

        } catch (error) {
            console.error('Failed to load data:', error);
            setPopupContent({
                title: "Error",
                message: "Failed to load notification preferences",
                type: "error"
            });
            setShowPopup(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.id_group_contact && !formData.id_contact) {
            setPopupContent({
                title: "Erreur de validation",
                message: "Veuillez sélectionner soit un groupe de contacts, soit un contact individuel",
                type: "error"
            });
            setShowPopup(true);
            return;
        }

        if (formData.id_group_contact && formData.id_contact) {
            setPopupContent({
                title: "Erreur de validation",
                message: "Veuillez sélectionner soit un groupe de contacts OU un contact individuel, pas les deux",
                type: "error"
            });
            setShowPopup(true);
            return;
        }

        try {
            const groupId = formData.id_group_contact;
            const contactId = formData.id_contact;

            const submitData: Omit<ContactNotificationPreference, 'id'> = {
                notifyOnFailed: formData.notifyOnFailed,
                notifyOnRecovery: formData.notifyOnRecovery,
                notifyOnSuccess: formData.notifyOnSuccess,
                notifyOnStart: formData.notifyOnStart,
                channelEmail: formData.channelEmail,
                channelSms: formData.channelSms,
                id_group_contact: groupId ? parseInt(groupId) : undefined,
                id_contact: contactId ? parseInt(contactId) : undefined,
                groupe: groupId ? { id: parseInt(groupId) } : undefined,
                contact: contactId ? { id: parseInt(contactId) } : undefined
            };

            if (editingPreference) {
                await updateNotificationPreference(editingPreference.id, submitData);
                setPopupContent({
                    title: "Succès",
                    message: "Préférence de notification mise à jour avec succès",
                    type: "success"
                });
            } else {
                await createNotificationPreference(submitData);
                setPopupContent({
                    title: "Succès",
                    message: "Préférence de notification créée avec succès",
                    type: "success"
                });
            }
            setShowPopup(true);
            resetForm();
            loadData();
        } catch (error) {
            console.error('Échec de l’enregistrement de la préférence:', error);
            setPopupContent({
                title: "Erreur",
                message: "Échec de l'enregistrement de la préférence de notification",
                type: "error"
            });
            setShowPopup(true);
        }
    };

    const handleEdit = (preference: ContactNotificationPreference) => {
        setEditingPreference(preference);
        const groupId = preference.groupe?.id?.toString() ?? '';
        const contactId = preference.contact?.id?.toString() ?? '';
        setFormData({
            notifyOnFailed: preference.notifyOnFailed,
            notifyOnRecovery: preference.notifyOnRecovery,
            notifyOnSuccess: preference.notifyOnSuccess,
            notifyOnStart: preference.notifyOnStart,
            channelEmail: preference.channelEmail,
            channelSms: preference.channelSms,
            id_group_contact: preference.id_group_contact?.toString() || '',
            id_contact: preference.id_contact?.toString() || '',
            groupe: { id_group_contact: groupId },
            contact: { id_contact: contactId }
        });

        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette préférence de notification?')) {
            try {
                await deleteNotificationPreference(id);
                setPopupContent({
                    title: "Succès",
                    message: "Préférence de notification supprimée avec succès",
                    type: "success"
                });
                setShowPopup(true);
                loadData();
            } catch (error) {
                console.error('Échec de la suppression de la préférence:', error);
                setPopupContent({
                    title: "Erreur",
                    message: "Échec de la suppression de la préférence de notification",
                    type: "error"
                });
                setShowPopup(true);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            notifyOnFailed: false,
            notifyOnRecovery: false,
            notifyOnSuccess: false,
            notifyOnStart: false,
            channelEmail: true,
            channelSms: false,
            id_group_contact: '',
            id_contact: '',
            groupe: { id_group_contact: '' },
            contact: { id_contact: '' }
        });
        setEditingPreference(null);
        setShowForm(false);
    };

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

            {/* En-tête */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                        <Settings className="h-6 w-6 mr-2 text-primary-600" />
                        Préférences de notification
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Configurez les paramètres de notification pour les contacts et les groupes
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une préférence
                </Button>
            </div>

            {/* Recherche */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                    type="text"
                    placeholder="Rechercher des préférences..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
            </div>

            {/* Formulaire modal */}
            {showForm && (
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {editingPreference ? 'Modifier la préférence de notification' : 'Ajouter une nouvelle préférence de notification'}
                        </h3>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Sélection de la cible */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Groupe de contacts
                                    </label>
                                    <select
                                        value={formData.id_group_contact}
                                        onChange={(e) => setFormData({ ...formData, id_group_contact: e.target.value, id_contact: '' })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="">Sélectionner un groupe</option>
                                        {groupes.map((groupe) => (
                                            <option key={groupe.id} value={groupe.id}>
                                                {groupe.nameGroupe}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Contact individuel
                                    </label>
                                    <select
                                        value={formData.id_contact}
                                        onChange={(e) => setFormData({ ...formData, id_contact: e.target.value, id_group_contact: '' })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="">Sélectionner un contact</option>
                                        {contacts.map((contact) => (
                                            <option key={contact.id} value={contact.id}>
                                                {contact.prenom} {contact.nom}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Déclencheurs de notification */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Notifier lorsque
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.notifyOnStart}
                                            onChange={(e) => setFormData({ ...formData, notifyOnStart: e.target.checked })}
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <PlayCircle className="h-4 w-4 ml-2 mr-1 text-blue-600" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Le job démarre</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.notifyOnFailed}
                                            onChange={(e) => setFormData({ ...formData, notifyOnFailed: e.target.checked })}
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <XCircle className="h-4 w-4 ml-2 mr-1 text-red-600" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Le job échoue</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.notifyOnRecovery}
                                            onChange={(e) => setFormData({ ...formData, notifyOnRecovery: e.target.checked })}
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <AlertTriangle className="h-4 w-4 ml-2 mr-1 text-yellow-600" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Le job se rétablit</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.notifyOnSuccess}
                                            onChange={(e) => setFormData({ ...formData, notifyOnSuccess: e.target.checked })}
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <CheckCircle className="h-4 w-4 ml-2 mr-1 text-green-600" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Le job réussit</span>
                                    </label>
                                </div>
                            </div>

                            {/* Canaux de notification */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Canaux de notification
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.channelEmail}
                                            onChange={(e) => setFormData({ ...formData, channelEmail: e.target.checked })}
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <Mail className="h-4 w-4 ml-2 mr-1 text-blue-600" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Email</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.channelSms}
                                            onChange={(e) => setFormData({ ...formData, channelSms: e.target.checked })}
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <MessageSquare className="h-4 w-4 ml-2 mr-1 text-green-600" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">SMS</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit">
                                    {editingPreference ? 'Mettre à jour' : 'Créer'}
                                </Button>
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    Annuler
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Liste des préférences */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredPreferences.map((preference) => (
                    <Card key={preference.id} hoverable>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                        {preference.groupe ?
                                            `Groupe : ${preference.groupe.nameGroupe}` :
                                            `Contact : ${preference.contact?.prenom} ${preference.contact?.nom}`
                                        }
                                    </h3>

                                    {/* Déclencheurs */}
                                    <div className="mb-3">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notifier pour :</p>
                                        <div className="flex flex-wrap gap-2">
                                            {preference.notifyOnStart && (
                                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                      <PlayCircle className="h-3 w-3 mr-1" />
                      Démarrage
                    </span>
                                            )}
                                            {preference.notifyOnFailed && (
                                                <span className="inline-flex items-center px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded-full">
                      <XCircle className="h-3 w-3 mr-1" />
                      Échec
                    </span>
                                            )}
                                            {preference.notifyOnRecovery && (
                                                <span className="inline-flex items-center px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Rétablissement
                    </span>
                                            )}
                                            {preference.notifyOnSuccess && (
                                                <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Succès
                    </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Canaux */}
                                    <div className="mb-3">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Canaux :</p>
                                        <div className="flex gap-2">
                                            {preference.channelEmail && (
                                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </span>
                                            )}
                                            {preference.channelSms && (
                                                <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      SMS
                    </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 ml-4">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(preference)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDelete(preference.id)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredPreferences.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Aucune préférence de notification trouvée
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {searchTerm ? 'Aucune préférence ne correspond à votre recherche.' : 'Commencez par créer votre première préférence de notification.'}
                        </p>
                        {!searchTerm && (
                            <Button onClick={() => setShowForm(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter la première préférence
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>

    );
};