import React, { useEffect, useState } from 'react';
import {
    Database, Cpu, Server, User, Tag, Info, Layers, Loader2
} from 'lucide-react';
import { Badge } from "../ui/Badge.tsx";
import { NodeDTO } from "../../types/NodeDTO.ts";
import { fetchNodesByProject } from "../../api/nodeApi.ts";
import { JobFormData } from "../../pages/JobCreate.tsx";

interface NodeJobProps {
    formData: JobFormData;
    onChange: (field: keyof JobFormData, value: any) => void;
    onNodeSelection?: (selectedNodes: NodeDTO[]) => void;
}

export const NodeJob: React.FC<NodeJobProps> = ({ formData, onChange }) => {
    const [nodes, setNodes] = useState<NodeDTO[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [loading, setLoading] = useState(false);

    const selectedNodeIds: string[] = Array.isArray(formData.nodeId)
        ? formData.nodeId
        : formData.nodeId
            ? [formData.nodeId]
            : [];

    const selectedNodeNames: string[] = Array.isArray(formData.nodename)
        ? formData.nodename
        : formData.nodename
            ? [formData.nodename]
            : [];

    useEffect(() => {
        const fetchNodes = async () => {
            if (!formData.projectId) return;
            setLoading(true);
            try {
                const fetchedNodes = await fetchNodesByProject(Number(formData.projectId));
                setNodes(fetchedNodes);
                setCurrentPage(1); // réinitialiser la page pour de nouvelles données
            } catch (err) {
                console.error("Échec du chargement des nœuds :", err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchNodes();
    }, [formData.projectId]);

    const getPriorityVariant = (enabled?: boolean): 'default' | 'warning' =>
        enabled ? 'warning' : 'default';

    const handleSelect = (node: NodeDTO) => {
        const idStr = String(node.id);
        const isSelected = selectedNodeIds.includes(idStr);

        const updatedIds = isSelected
            ? selectedNodeIds.filter(id => id !== idStr)
            : [...selectedNodeIds, idStr];

        const updatedNames = isSelected
            ? selectedNodeNames.filter(name => name !== node.nodename)
            : [...selectedNodeNames, node.nodename];

        onChange('nodeId', updatedIds);
        onChange('nodename', updatedNames);
    };

    // Filtrer les nœuds selon la recherche
    const filteredNodes = nodes.filter(node =>
        node.nodename.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination : calcul des indices pour slice
    const totalPages = Math.ceil(filteredNodes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedNodes = filteredNodes.slice(startIndex, startIndex + itemsPerPage);

    // Gérer changement de page
    const goToPreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };
    const goToNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };
    if (loading) return ( <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-green-600 dark:text-green-400" />
            <span className="text-green-600 dark:text-green-400 animate-pulse">
        Chargement des données...
      </span>
        </div>
    );
    return (
        <div className="space-y-8">
            <section className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
                <header className="flex items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
                    <Database className="text-primary-600 mr-3" size={24} />
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        Sélection du nœud d'exécution
                    </h2>
                </header>

                {!formData.projectId ? (
                    <p className="text-center text-red-600 dark:text-red-400 font-semibold">
                        Veuillez d'abord sélectionner un projet.
                    </p>
                ) : (
                    <>
                        {/* Recherche */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Rechercher des nœuds..."
                                value={searchTerm}
                                onChange={e => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); // réinitialiser la page pour une nouvelle recherche
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>

                        {/* Liste paginée */}
                        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {paginatedNodes.length === 0 ? (
                                <p className="text-center col-span-full text-gray-500 dark:text-gray-400">
                                    Aucun nœud ne correspond à votre recherche.
                                </p>
                            ) : (
                                paginatedNodes.map(node => {
                                    const isSelected = selectedNodeIds.includes(String(node.id));
                                    return (
                                        <article
                                            key={node.id}
                                            className={`group cursor-pointer rounded-lg border transition-shadow duration-300 ease-in-out shadow-sm
                                            ${
                                                isSelected
                                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-primary-400/30'
                                                    : 'border-gray-300 dark:border-gray-700 hover:shadow-lg'
                                            }`}
                                            onClick={() => handleSelect(node)}
                                        >
                                            <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    readOnly
                                                    onClick={e => e.stopPropagation()}
                                                    className="h-5 w-5 text-primary-600 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:ring-2"
                                                />
                                                <h3 className="ml-4 font-semibold text-lg text-gray-900 dark:text-gray-100 truncate">
                                                    {node.nodename}
                                                </h3>
                                                <div className="ml-auto">
                                                    <Badge variant={getPriorityVariant(node.enabled)} size="sm">
                                                        {node.enabled ? 'Activé' : 'Désactivé'}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="p-4 space-y-3">
                                                <p
                                                    className="text-gray-700 dark:text-gray-300 text-sm italic line-clamp-2"
                                                    title={node.description || 'Pas de description'}
                                                >
                                                    <Info className="inline mr-1" size={14} /> {node.description || 'Pas de description'}
                                                </p>
                                                <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-600 dark:text-gray-400 text-xs">
                                                    <li className="flex items-center">
                                                        <Server className="mr-1" size={14} /> {node.hostname}
                                                    </li>
                                                    <li className="flex items-center">
                                                        <User className="mr-1" size={14} /> {node.username}
                                                    </li>
                                                    <li className="flex items-center">
                                                        <Layers  className="mr-1" size={14} /> {node.osName ?? 'N/D'} ({node.osFamily ?? 'N/D'})
                                                    </li>
                                                    <li className="flex items-center">
                                                        <Cpu className="mr-1" size={14} /> {node.osArch ?? 'N/D'}
                                                    </li>
                                                    <li className="flex items-center col-span-2">
                                                        <Tag className="mr-1" size={14} /> {node.tags || 'Aucun'}
                                                    </li>
                                                </ul>
                                            </div>
                                        </article>
                                    );
                                })
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center items-center space-x-4 mt-6">
                            <button
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Précédent
                            </button>
                            <span className="text-gray-700 dark:text-gray-300">
                                Page {currentPage} sur {totalPages}
                            </span>
                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Suivant
                            </button>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
};
