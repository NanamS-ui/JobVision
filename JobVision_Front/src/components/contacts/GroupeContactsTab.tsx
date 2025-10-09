import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { GroupeContact } from '../../types/Contact';
import { fetchGroupeContacts, createGroupeContact, updateGroupeContact, deleteGroupeContact } from '../../api/contactApi';
import {Plus, Edit, Trash2, Users, Search, Loader2} from 'lucide-react';
import PopupMessage from '../pop-up/PopupMessage';

export const GroupeContactsTab: React.FC = () => {
    const [groupes, setGroupes] = useState<GroupeContact[]>([]);
    const [filteredGroupes, setFilteredGroupes] = useState<GroupeContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingGroupe, setEditingGroupe] = useState<GroupeContact | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        nameGroupe: '',
        description: ''
    });
    const [showPopup, setShowPopup] = useState(false);
    const [popupContent, setPopupContent] = useState<{ message: string; type: 'error' | 'info' | 'success', title?: string } | null>(null);

    useEffect(() => {
        loadGroupes();
    }, []);

    useEffect(() => {
        const filtered = groupes.filter(groupe =>
            groupe.nameGroupe.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (groupe.description && groupe.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredGroupes(filtered);
    }, [groupes, searchTerm]);

    const loadGroupes = async () => {
        try {
            setLoading(true);
            const data = await fetchGroupeContacts();

                setGroupes(data);

        } catch (error) {
            console.error('Failed to load groupes:', error);
            setPopupContent({
                title: "Error",
                message: "Failed to load contact groups",
                type: "error"
            });
            setShowPopup(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nameGroupe.trim()) {
            setPopupContent({
                title: "Erreur de validation",
                message: "Le nom du groupe est obligatoire",
                type: "error"
            });
            setShowPopup(true);
            return;
        }

        try {
            if (editingGroupe) {
                await updateGroupeContact(editingGroupe.id, formData);
                setPopupContent({
                    title: "Succès",
                    message: "Groupe de contacts mis à jour avec succès",
                    type: "success"
                });
            } else {
                await createGroupeContact(formData);
                setPopupContent({
                    title: "Succès",
                    message: "Groupe de contacts créé avec succès",
                    type: "success"
                });
            }
            setShowPopup(true);
            resetForm();
            loadGroupes();
        } catch (error) {
            console.error('Failed to save groupe:', error);
            setPopupContent({
                title: "Erreur",
                message: "Échec de l'enregistrement du groupe de contacts",
                type: "error"
            });
            setShowPopup(true);
        }
    };

    const handleEdit = (groupe: GroupeContact) => {
        setEditingGroupe(groupe);
        setFormData({
            nameGroupe: groupe.nameGroupe,
            description: groupe.description || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce groupe de contacts ?')) {
            try {
                await deleteGroupeContact(id);
                setPopupContent({
                    title: "Succès",
                    message: "Groupe de contacts supprimé avec succès",
                    type: "success"
                });
                setShowPopup(true);
                loadGroupes();
            } catch (error) {
                console.error('Failed to delete groupe:', error);
                setPopupContent({
                    title: "Erreur",
                    message: "Échec de la suppression du groupe de contacts",
                    type: "error"
                });
                setShowPopup(true);
            }
        }
    };

    const resetForm = () => {
        setFormData({ nameGroupe: '', description: '' });
        setEditingGroupe(null);
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
                        <Users className="h-6 w-6 mr-2 text-primary-600" />
                        Groupes de contacts
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gérez les groupes de contacts pour les notifications
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un groupe
                </Button>
            </div>

            {/* Recherche */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                    type="text"
                    placeholder="Rechercher des groupes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
            </div>

            {/* Formulaire Modal */}
            {showForm && (
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {editingGroupe ? 'Modifier le groupe de contacts' : 'Ajouter un nouveau groupe de contacts'}
                        </h3>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nom du groupe *
                                </label>
                                <input
                                    type="text"
                                    value={formData.nameGroupe}
                                    onChange={(e) => setFormData({ ...formData, nameGroupe: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">
                                    {editingGroupe ? 'Mettre à jour' : 'Créer'}
                                </Button>
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    Annuler
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Liste des groupes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGroupes.map((groupe) => (
                    <Card key={groupe.id} hoverable>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                        {groupe.nameGroupe}
                                    </h3>
                                    {groupe.description && (
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                            {groupe.description}
                                        </p>
                                    )}
                                    <div className="text-xs text-gray-500 dark:text-gray-500">
                                        Créé le : {new Date(groupe.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEdit(groupe)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDelete(groupe.id)}
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

            {filteredGroupes.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Aucun groupe de contacts trouvé
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {searchTerm
                                ? "Aucun groupe ne correspond à vos critères de recherche."
                                : "Commencez par créer votre premier groupe de contacts."}
                        </p>
                        {!searchTerm && (
                            <Button onClick={() => setShowForm(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter le premier groupe
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};