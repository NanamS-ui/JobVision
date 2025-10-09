import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {Key, Plus, Trash2, HardDrive, Loader2} from 'lucide-react';
import { SshPathStats } from "../types/SshPathStats.ts";
import React, { useEffect, useState } from "react";
import {deleteSshPathById, getSshPathStats, saveSshPath} from "../api/sshPathApi.ts";
import { StatusChart } from "../components/charts/StatusChartProps.tsx";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '../components/ui/Dialog.tsx';
import PopupMessage from "../components/pop-up/PopupMessage.tsx";

const COLORS = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a4de6c", "#d0ed57",
];

export const SSHKeys: React.FC = () => {
    useEffect(() => {
        document.title = "SSH - JobVision";
    }, []);
    const [stats, setStats] = useState<SshPathStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getSshPathStats()
            .then((data) => {
                setStats(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Erreur lors du chargement des statistiques");
                setLoading(false);
            });
    }, []);

    const translateKeyType = (keyType: string): string => {
        switch (keyType) {
            case 'password':
                return 'Mot de passe';
            case 'private':
            case 'privateKey':
                return 'Clé privée';
            default:
                return keyType; // valeur brute si non traduite
        }
    };


    const [popup, setPopup] = useState<{
        message: string;
        type: 'success' | 'error' | 'info';
    } | null>(null);

    const handleClosePopup = () => setPopup(null);
    const [open, setOpen] = useState(false);
    const [keyType, setKeyType] = useState<'password' | 'private'>('password');
    const [formData, setFormData] = useState({
        name_key: '',
        ssh_port: '',
        key_storage: '',
        password: '',
        privateKey: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            // Si tu veux récupérer le contenu du fichier et le mettre dans privateKey, décommente :
            /*
            const reader = new FileReader();
            reader.onload = (event) => {
              const text = event.target?.result;
              if (typeof text === 'string') {
                setFormData(prev => ({ ...prev, privateKey: text }));
              }
            };
            reader.readAsText(file);
            */
        } else {
            setFileName(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const sshPath = {
            name : formData.name_key,
            keyStorage: formData.key_storage,
            keyType: keyType === "password" ? "password" : "privateKey",
            sshPort: formData.ssh_port,
            password: keyType === "password" ? formData.password : undefined,
            privateKeyContent: keyType === "private" ? formData.privateKey : undefined,
            nameKeyPrivate: keyType === "private" && fileName ? fileName : undefined
        };

        try {
            const result = await saveSshPath(sshPath);
            console.log("Clé SSH enregistrée :", result);

            setPopup({
                message: "Clé SSH enregistrée avec succès !",
                type: "success"
            });

            const updatedStats = await getSshPathStats();
            setStats(updatedStats);

            setOpen(false);
            setFormData({
                name_key: '',
                ssh_port: '',
                key_storage: '',
                password: '',
                privateKey: ''
            });
            setFileName(null);
            setKeyType('password');
        } catch (error) {
            console.error("Erreur lors de l'enregistrement :", error);

            setPopup({
                message: "Error saving SSH key: "+ error,
                type: "error"
            });
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette clé SSH ?")) {
            try {
                await deleteSshPathById(id);

                setPopup({
                    message: "Clé SSH supprimée avec succès !",
                    type: "info"
                });
                // Refresh your data after deletion
                const updatedStats = await getSshPathStats();
                setStats(updatedStats);
            } catch (error) {
                console.error("Failed to delete SSH key:", error);

                setPopup({
                    message: "Error deleting SSH key: "+ error,
                    type: "error"
                });
                // Handle error (show toast, etc.)
            }
        }
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
    if (error) return <p className="text-red-500">{error}</p>;
    if (!stats) return null;

    const chartDatakeyTypeMap = Object.entries(stats.keyTypeMap).map(([name, value], index) => ({
        name: translateKeyType(name),
        value,
        color: COLORS[index % COLORS.length],
    }));

    const chartNodeCountByKeyType = Object.entries(stats.nodeCountByKeyType).map(([name, value], index) => ({
        name: translateKeyType(name),
        value,
        color: COLORS[index % COLORS.length],
    }));

    function getKeyTypeColor(type: string): 'default' | 'success' | 'warning' | 'error' | 'info' {
        switch (type.toLowerCase()) {
            case 'password':
                return 'warning';
            case 'privatekey':
                return 'success';
            case 'ed25519':
                return 'info';
            default:
                return 'default';
        }
    }
    return (
        <div className="space-y-6">
            {popup && (
                <PopupMessage
                    message={popup.message}
                    type={popup.type}
                    onClose={handleClosePopup}
                    duration={3000}
                    position={"top-center"}
                    showIcon={true}
                    animated={true}
                />
            )}

            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Gestion des clés SSH
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gérez les clés SSH pour un accès sécurisé aux serveurs et les déploiements
                    </p>
                </div>

                <Button variant="primary" onClick={() => setOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une clé SSH
                </Button>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total des clés */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900">
                                <Key className="h-6 w-6 text-primary-600 " />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 ">Total des clés</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 ">
                                    {stats.totalKeys}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Chemins uniques */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                                <HardDrive className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Chemins de stockage uniques</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                    {stats.uniquePaths}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Graphiques */}
                <Card>
                    <CardContent>
                        <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Répartition par type de clé</h3>
                        <StatusChart data={chartDatakeyTypeMap} height={250} />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Nombre de nœuds par type de clé</h3>
                        <StatusChart data={chartNodeCountByKeyType} height={250} />
                    </CardContent>
                </Card>
            </div>

            {/* Liste des clés SSH */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Clés SSH ({stats.sshPaths.length})
                    </h3>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.sshPaths.map((key) => (
                            <div
                                key={key.id}
                                className="border border-muted dark:border-gray-700 rounded-lg p-4 hover:shadow-sm transition-shadow bg-background"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-3">
                                        {/* Nom + Type */}
                                        <div className="flex items-center gap-2">
                                            <Key className="h-4 w-4 text-primary dark:text-gray-100" />
                                            <h4 className="text-base font-semibold text-foreground dark:text-gray-100">
                                                {key.name || "Clé sans nom"}
                                            </h4>
                                            <Badge variant={getKeyTypeColor(key.keyType)}>
                                                {translateKeyType(key.keyType).toUpperCase()}
                                            </Badge>
                                        </div>

                                        {/* Port SSH */}
                                        <div>
                                            <p className="text-xs text-muted-foreground dark:text-gray-100">Port SSH</p>
                                            <p className="text-sm text-foreground dark:text-gray-100">{key.sshPort || "22"}</p>
                                        </div>

                                        {/* Emplacement */}
                                        <div>
                                            <p className="text-xs text-muted-foreground dark:text-gray-100">Chemin de stockage</p>
                                            <p className="text-sm text-foreground dark:text-gray-100">{key.keyStorage}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-1 ml-4">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                            onClick={() => {
                                                if (key.id !== undefined) {
                                                    handleDelete(key.id);
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Dialogue - Formulaire d'ajout de clé SSH */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ajouter une clé SSH</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom de la clé</label>
                            <input
                                type="text"
                                name="name_key"
                                value={formData.name_key}
                                onChange={handleChange}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-white focus:outline-none focus:ring focus:ring-primary-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Type de clé</label>
                            <div className="flex space-x-4">
                                <label className="flex items-center space-x-2 dark:text-gray-300">
                                    <input
                                        type="radio"
                                        name="key_type"
                                        value="password"
                                        checked={keyType === 'password'}
                                        onChange={() => setKeyType('password')}
                                    />
                                    <span>Mot de passe</span>
                                </label>
                                <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                                    <input
                                        type="radio"
                                        name="key_type"
                                        value="privateKey"
                                        checked={keyType === 'private'}
                                        onChange={() => setKeyType('private')}
                                    />
                                    <span>Clé privée</span>
                                </label>
                            </div>
                        </div>

                        {keyType === 'password' ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mot de passe</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-white focus:outline-none focus:ring focus:ring-primary-500"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Clé privée</label>
                                <textarea
                                    name="privateKey"
                                    value={formData.privateKey}
                                    onChange={handleChange}
                                    rows={6}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-white focus:outline-none focus:ring focus:ring-primary-500"
                                    placeholder="Collez votre clé privée ici..."
                                />
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Télécharger un fichier de clé privée (optionnel)</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".pem,.key,.txt"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        id="file-input"
                                    />
                                    <label
                                        htmlFor="file-input"
                                        className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
                                    >
                                        <svg
                                            className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L15.172 7z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                                            />
                                        </svg>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {fileName ? fileName : "Cliquez pour joindre un fichier"}
                                        </span>
                                    </label>
                                </div>
                                {fileName && (
                                    <div className="mt-2 flex items-center">
                                        <svg
                                            className="w-4 h-4 mr-2 text-green-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        <p className="text-sm text-green-600 dark:text-green-400">Fichier sélectionné : {fileName}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Port SSH</label>
                            <input
                                type="text"
                                name="ssh_port"
                                value={formData.ssh_port}
                                onChange={handleChange}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-white focus:outline-none focus:ring focus:ring-primary-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Chemin de stockage</label>
                            <input
                                type="text"
                                name="key_storage"
                                value={formData.key_storage}
                                onChange={handleChange}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-white focus:outline-none focus:ring focus:ring-primary-500"
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Annuler
                            </Button>
                            <Button type="submit" variant="primary">
                                Enregistrer
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};
export default SSHKeys;
