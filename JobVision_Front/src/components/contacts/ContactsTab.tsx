import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import {Contact, ContactPayload, GroupeContact} from '../../types/Contact';
import { fetchContacts, createContact, updateContact, deleteContact, fetchGroupeContacts } from '../../api/contactApi';
import {Plus, Edit, Trash2, User, Search, Mail, Phone, Loader2} from 'lucide-react';
import PopupMessage from '../pop-up/PopupMessage';

export const ContactsTab: React.FC = () => {
    const [contacts, setContacts] = useState<ContactPayload[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<ContactPayload[]>([]);
    const [groupes, setGroupes] = useState<GroupeContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    interface FormData extends Omit<ContactPayload, 'id'> {
        id?: number;
    }

    const [formData, setFormData] = useState<FormData>({
        id: undefined,
        nom: '',
        prenom: '',
        email: '',
        telephone: '', // juste le numéro
        groupes: [],
        nomsGroupes: [],
        createAt: undefined,
        updateAt: undefined,
    });
    const [showPopup, setShowPopup] = useState(false);
    const [popupContent, setPopupContent] = useState<{ message: string; type: 'error' | 'info' | 'success', title?: string } | null>(null);
    const [selectCount, setSelectCount] = useState(1);

    const handleSelectChange = (index: number, value: number) => {
        const newGroupes = [...(formData.groupes || [])];
        newGroupes[index] = value;
        setFormData({ ...formData, groupes: newGroupes });
    };

    // Ajouter un nouveau select vide (null ou undefined)
    const handleAddGroup = () => {
        setSelectCount(selectCount + 1);
        setFormData({ ...formData, groupes: [...(formData.groupes || []), -1] }); // -1 ou null pour aucune sélection initiale
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const filtered = contacts.filter(contact =>
            `${contact.prenom} ${contact.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (contact.telephone && contact.telephone.includes(searchTerm))
        );
        setFilteredContacts(filtered);
    }, [contacts, searchTerm]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [contactsData, groupesData] = await Promise.all([
                fetchContacts(),
                fetchGroupeContacts()
            ]);
            console.log(contactsData);
            setGroupes(groupesData);
            setContacts(contactsData);

        } catch (error) {
            console.error('Failed to load data:', error);
            setPopupContent({
                title: "Error",
                message: "Failed to load contacts",
                type: "error"
            });
            setShowPopup(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nom.trim() && !formData.prenom.trim()) {
            setPopupContent({
                title: "Erreur de validation",
                message: "Le prénom ou le nom est obligatoire",
                type: "error"
            });
            setShowPopup(true);
            return;
        }

        try {
            const submitData: ContactPayload = {
                id: formData.id ?? 0,
                nom: formData.nom,
                prenom: formData.prenom,
                email: formData.email,
                telephone: formData.telephone, // pas de préfixe pays
                groupes: formData.groupes
                    ?.filter(g => g !== -1)
                    .map(g => (typeof g === 'string' ? parseInt(g) : g)) || []
            };

            if (editingContact && formData.id) {
                await updateContact(formData.id, submitData);
                setPopupContent({
                    title: "Succès",
                    message: "Contact mis à jour avec succès",
                    type: "success",
                });
            } else {
                await createContact(submitData);
                setPopupContent({
                    title: "Succès",
                    message: "Contact créé avec succès",
                    type: "success",
                });
            }
            setShowPopup(true);
            resetForm();
            loadData();
        } catch (error) {
            console.error('Échec de la sauvegarde du contact:', error);
            setPopupContent({
                title: "Erreur",
                message: "Échec de la sauvegarde du contact",
                type: "error"
            });
            setShowPopup(true);
        }
    };

    const handleEdit = (contact: any) => {
        setEditingContact(contact);
        const payload: FormData = {
            id: contact.id ?? undefined,
            nom: contact.nom ?? '',
            prenom: contact.prenom ?? '',
            email: contact.email ?? '',
            telephone: contact.telephone ?? '',
            groupes: contact.groupes?.map((g: any) => (typeof g === 'number' ? g : g.id)) ?? []
        };
        setFormData(payload);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
            try {
                await deleteContact(id);
                setPopupContent({
                    title: "Succès",
                    message: "Contact supprimé avec succès",
                    type: "success"
                });
                setShowPopup(true);
                loadData();
            } catch (error) {
                console.error('Échec de la suppression du contact:', error);
                setPopupContent({
                    title: "Erreur",
                    message: "Échec de la suppression du contact",
                    type: "error"
                });
                setShowPopup(true);
            }
        }
    };


    const resetForm = () => {
        setFormData({ id :0,nom: '', prenom: '', email: '', telephone: '', groupes: [] });
        setEditingContact(null);
        setShowForm(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-green-600 dark:text-green-400" />
                <span className="text-green-600 dark:text-green-400 animate-pulse">
                    Loading data...
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
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                        <User className="h-6 w-6 mr-2 text-primary-600" />
                        Contacts
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gérer les contacts individuels pour les notifications
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un contact
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                    type="text"
                    placeholder="Rechercher des contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
            </div>

            {/* Form Modal */}
            {showForm && (
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {editingContact ? 'Modifier le contact' : 'Ajouter un nouveau contact'}
                        </h3>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Prénom
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.prenom}
                                        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nom
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nom}
                                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="telephone" className="block text-gray-700 dark:text-gray-200 font-medium mb-1">
                                    Téléphone
                                </label>
                                <input
                                    type="text"
                                    id="telephone"
                                    name="telephone"
                                    value={formData.telephone}
                                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                    placeholder="Entrez le numéro de téléphone"
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Groupe(s) de contact
                                </label>

                                {[...Array(selectCount)].map((_, i) => (
                                    <div key={i} className="flex items-center mb-2">
                                        <select
                                            value={formData.groupes?.[i] ?? -1}
                                            onChange={(e) => handleSelectChange(i, Number(e.target.value))}
                                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
                                        >
                                            <option value={-1}>Sélectionner un groupe</option>
                                            {groupes.map((groupe) => (
                                                <option key={groupe.id} value={groupe.id}>
                                                    {groupe.nameGroupe}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                // Supprimer le select i
                                                const newGroupes = [...(formData.groupes || [])];
                                                newGroupes.splice(i, 1);
                                                setFormData({ ...formData, groupes: newGroupes });
                                                setSelectCount(selectCount - 1);
                                            }}
                                            className="ml-2 p-2 text-red-600 hover:text-red-800"
                                            aria-label="Supprimer ce groupe"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={handleAddGroup}
                                    className="mt-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                                >
                                    Ajouter un autre groupe
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">
                                    {editingContact ? 'Mettre à jour' : 'Créer'}
                                </Button>
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    Annuler
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Contacts List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredContacts.map((contact) => (
                    <Card key={contact.id} hoverable>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 overflow-hidden">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                        {contact.prenom} {contact.nom}
                                    </h3>
                                    {contact.email && (
                                        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-1">
                                            <Mail className="h-4 w-4 mr-2" />
                                            {contact.email}
                                        </div>
                                    )}
                                    {contact.telephone && (
                                        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-2">
                                            <Phone className="h-4 w-4 mr-2" />
                                            {contact.telephone}
                                        </div>
                                    )}
                                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-2">
                                        Créé le : {contact.createAt ? new Date(contact.createAt).toLocaleDateString() : 'N/A'}
                                    </div>

                                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-2">
                                        Mis à jour le : {contact.updateAt ? new Date(contact.updateAt).toLocaleDateString() : 'N/A'}
                                    </div>
                                    {contact.nomsGroupes?.map((nom, index) => (
                                        <div
                                            key={index}
                                            className="inline-block px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs rounded-full mb-2 mr-2"
                                        >
                                            {nom}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2 ml-4 shrink-0">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(contact)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDelete(contact.id)}
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

            {filteredContacts.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Aucun contact trouvé
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {searchTerm
                                ? "Aucun contact ne correspond à vos critères de recherche."
                                : "Commencez par créer votre premier contact."}
                        </p>
                        {!searchTerm && (
                            <Button onClick={() => setShowForm(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter le premier contact
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};