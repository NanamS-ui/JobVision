import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { MetricChart } from '../components/charts/MetricChart';
import {
    Server,
    MonitorSmartphone,
    User as UserIcon,
    CheckCircle as CheckCircleIcon,
    XCircle as XCircleIcon,
    Cpu,
    Info,
    Key,
    Fingerprint,
    Share2,
    Database,
    Tag,
    Folder,
    FolderOpen,
    Calendar,
    RefreshCw, LucideIcon, Network, Filter, Briefcase, ChevronLeft, ChevronRight, Terminal, Trash
} from 'lucide-react';

import { NodeStats } from "../types/NodeStats.ts";
import {autocompleteNodename, createNode, deleteNode, fetchNodeStats, updateNode} from "../api/nodeApi.ts";
import { StatusChart } from "../components/charts/StatusChartProps.tsx";
import {formatDate} from "../utils/dateUtils.ts";
import {NodeDTO} from "../types/NodeDTO.ts";
import {useNavigate} from "react-router-dom";
import {SshPathDTO} from "../types/SshPathDTO.ts";
import {ProjectDTO} from "../types/ProjectDTO.ts";
import {fetchAllSshPaths} from "../api/sshPathApi.ts";
import {fetchAllProjects} from "../api/projectApi.ts";
import PopupMessage from "../components/pop-up/PopupMessage.tsx";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "../components/ui/Dialog.tsx";
import { Select, SelectItem } from "../components/ui/Select.tsx";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f'];

export const Nodes: React.FC = () => {
    useEffect(() => {
        document.title = "Noeuds - JobVision";
    }, []);

    const navigate = useNavigate();

    interface Metric {
        title: string;
        value: number | string;
        icon: LucideIcon;
        bgColor: string;
        iconColor: string;
    }

    const [stats, setStats] = useState<NodeStats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setLoading(true);
        fetchNodeStats()
            .then(data => setStats(data))
            .catch(err => console.error('Erreur lors de la récupération des statistiques du nœud:', err))
            .finally(() => setLoading(false));
    }, []);

    const [searchQuery, setSearchQuery] = useState('');
    const [autocompleteResults, setAutocompleteResults] = useState<NodeDTO[]>([]);

    // Filtres et tri
    const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
    const [osFilter, setOsFilter] = useState<string>('all');
    const [projectFilter, setProjectFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt' | 'jobs'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(8);

    // Auto-complete search
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchQuery.trim().length >= 2) {
                autocompleteNodename(searchQuery).then(setAutocompleteResults);
            } else {
                setAutocompleteResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    const metrics: Metric[] = [
        {
            title: "Total des nœuds activés",
            value: stats?.totalEnabledNodes ?? "-",
            icon: Network,
            bgColor: "bg-primary-100 dark:bg-primary-900",
            iconColor: "text-primary-600",
        },
        {
            title: "Nœuds dans les filtres",
            value: stats?.nodesInFilters ?? "-",
            icon: Filter,
            bgColor: "bg-blue-100 dark:bg-blue-900",
            iconColor: "text-blue-600",
        },
        {
            title: "Jobs sur les nœuds actifs",
            value: stats?.jobsOnActiveNodes ?? "-",
            icon: Briefcase,
            bgColor: "bg-purple-100 dark:bg-purple-900",
            iconColor: "text-purple-600",
        },
        {
            title: "OS distinctes",
            value: stats?.distinctOsFamilies ?? "-",
            icon: MonitorSmartphone,
            bgColor: "bg-yellow-100 dark:bg-yellow-900",
            iconColor: "text-yellow-600",
        },
    ];


    const osData = stats
        ? Object.entries(stats.osNodeCountMap).map(([name, value], i) => ({
            name,
            value,
            color: COLORS[i % COLORS.length],
        }))
        : [];

    const jobsData = stats
        ? Object.entries(stats.nodeJobCountMap).map(([name, value]) => ({
            name,
            jobs: value,
        }))
        : [];

    const getStatusBadge = (enabled: boolean): "default" | "success" | "warning" | "error" | "info" | undefined => {
        return enabled ? "success" : "error";
    };

    const allNodes = stats?.nodes ?? [];

    const jobsMap: Record<string, number> = stats?.nodeJobCountMap ?? {};

    const sourceNodes: NodeDTO[] = searchQuery.trim().length >= 2 ? autocompleteResults : allNodes;

    const filteredNodes = sourceNodes
        .filter((node) => {
            const statusOk =
                statusFilter === 'all' ||
                (statusFilter === 'enabled' && node.enabled) ||
                (statusFilter === 'disabled' && !node.enabled);

            const osOk = osFilter === 'all' || (node.osFamily ?? '') === osFilter;

            const projectOk =
                projectFilter === 'all' ||
                node.projects?.some((p) => String(p.id) === projectFilter);

            return statusOk && osOk && projectOk;
        })
        .sort((a, b) => {
            const orderFactor = sortOrder === 'asc' ? 1 : -1;
            if (sortBy === 'name') {
                return orderFactor * a.nodename.localeCompare(b.nodename);
            }
            if (sortBy === 'createdAt') {
                const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return orderFactor * (aTime - bTime);
            }
            if (sortBy === 'updatedAt') {
                const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
                const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
                return orderFactor * (aTime - bTime);
            }
            // jobs
            const aJobs = jobsMap[a.nodename] ?? 0;
            const bJobs = jobsMap[b.nodename] ?? 0;
            return orderFactor * (aJobs - bJobs);
        });

    const totalPages = Math.max(1, Math.ceil(filteredNodes.length / itemsPerPage));
    const paginatedNodes = filteredNodes.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const openModal = () => setIsCreateModalOpen(true);
    const closeModal = () => {
        setIsCreateModalOpen(false);
        setIsEditMode(false);
        setSelectedNode(null);

        setNodeName("");
        setHostname("");
        setUsername("");
        setOsFamily("");
        setOsName("");
        setOsArch("");
        setTags("");
        setDescription("");
        setSelectedSshPathId(null);
        setSelectedProjectIds([]);
    };

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [nodeName, setNodeName] = useState("");
    const [hostname, setHostname] = useState("");
    const [username, setUsername] = useState("");
    const [osFamily, setOsFamily] = useState("");
    const [osName, setOsName] = useState("");
    const [osArch, setOsArch] = useState("");
    const [tags, setTags] = useState("");
    const [description, setDescription] = useState("");

    const [sshPaths, setSshPaths] = useState<SshPathDTO[]>([]);
    const [projects, setProjects] = useState<ProjectDTO[]>([]);
    const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
    const [selectedSshPathId, setSelectedSshPathId] = useState<number | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [sshData, projectData] = await Promise.all([
                    fetchAllSshPaths(),
                    fetchAllProjects(),
                ]);
                setSshPaths(sshData);
                setProjects(projectData);
            } catch (error) {
                console.error("Erreur lors du chargement des données SSH ou Projects", error);
            }
        }

        fetchData();
    }, []);


    function toggleProjectSelection(id: number) {
        setSelectedProjectIds(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    }

    const [popup, setPopup] = useState<{
        message: string;
        type: 'success' | 'error' | 'info';
    } | null>(null);

    const [selectedNode, setSelectedNode] = useState<NodeDTO | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const openEditModal = (node: NodeDTO) => {
        setIsEditMode(true);
        setSelectedNode(node);
        setNodeName(node.nodename);
        setHostname(node.hostname);
        setUsername(node.username);
        setOsFamily(node.osFamily || "");
        setOsName(node.osName || "");
        setOsArch(node.osArch || "");
        setTags(node.tags || "");
        setDescription(node.description || "");
        setSelectedSshPathId(node.sshPath?.id || null);
        setSelectedProjectIds(node.projects?.map(p => p.id) || []);
        setIsCreateModalOpen(true);
    };

    async function handleSubmitNode(e: React.FormEvent) {
        e.preventDefault();

        if (!selectedSshPathId) {
            setPopup({ message: "Le chemin SSH est requis.", type: "error" });
            return;
        }

        const selectedSshPath = sshPaths.find(path => path.id === selectedSshPathId);
        const selectedProjects = projects.filter(p => selectedProjectIds.includes(p.id));

        const nodeToSave: NodeDTO = {
            id: selectedNode?.id ?? 0,
            nodename: nodeName,
            hostname: hostname,
            username: username,
            osFamily: osFamily || null,
            osName: osName || null,
            osArch: osArch || null,
            tags: tags || null,
            description: description || null,
            enabled: true,
            createdAt: selectedNode?.createdAt || null,
            updatedAt: null,
            sshPath: selectedSshPath!,
            projects: selectedProjects,
        };

        try {
            if (isEditMode) {
                await updateNode(nodeToSave);
                setPopup({ message: "Nœud mis à jour avec succès", type: "success" });
            } else {
                await createNode(nodeToSave);
                setPopup({ message: "Nœud créé avec succès", type: "success" });
            }
            closeModal();
            const updatedStats = await fetchNodeStats();
            setStats(updatedStats);
        } catch (error) {
            console.error("Erreur :", error);
            setPopup({ message: "Erreur lors de la sauvegarde du node.", type: "error" });
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce nœud?\n" +
            "\n" +
            "Cela supprimera également tous les journaux associés.")) return;

        try {
            await deleteNode(id); // appel API de suppression
            setPopup({ message: "Nœud supprimé avec succès.", type: "info" });

            const updatedStats = await fetchNodeStats();
            setStats(updatedStats); // mise à jour des statistiques si besoin
        } catch (error) {
            console.error("Error deleting node:", error);
            setPopup({ message: "Échec de la suppression du nœud.", type: "error" });
        }
    };

    return (
        <div className="space-y-6">
            {popup && (
                <PopupMessage
                    message={popup.message}
                    type={popup.type}
                    onClose={() => setPopup(null)}
                    duration={3000}
                    position="top-center"
                    showIcon={true}
                    animated={true}
                />
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Gestion des nœuds
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Surveillez les nœuds des serveurs et l’état de l’infrastructure
                    </p>
                </div>
                <Button onClick={openModal} variant="primary">
                    <Server className="h-4 w-4 mr-2" />
                    Ajouter un nœud
                </Button>
            </div>

            {/* Statistiques des nœuds */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {loading
                    ? Array.from({ length: 4 }).map((_, index) => (
                        <Card key={index}>
                            <CardContent className="p-4">
                                <div className="animate-pulse h-16 bg-gray-100 dark:bg-gray-700 rounded" />
                            </CardContent>
                        </Card>
                    ))
                    : metrics.map(({ title, value, icon: Icon, bgColor, iconColor }, index) => (
                        <Card key={index}>
                            <CardContent className="p-4">
                                <div className="flex items-center">
                                    <div className={`p-2 rounded-lg ${bgColor}`}>
                                        <Icon className={`h-6 w-6 ${iconColor}`} />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {title}
                                        </p>
                                        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                            {value}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
            </div>

            {/* Graphiques de performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                    <>
                        {Array.from({ length: 2 }).map((_, i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <div className="h-6 w-1/2 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px] bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                                </CardContent>
                            </Card>
                        ))}
                    </>
                ) : (
                    <>
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Nombre de nœuds par famille d’OS
                                </h3>
                            </CardHeader>
                            <CardContent>
                                <StatusChart data={osData} height={300} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Jobs par nœud
                                </h3>
                            </CardHeader>
                            <CardContent>
                                <MetricChart
                                    data={jobsData}
                                    dataKey="jobs"
                                    nameKey="name"
                                    title="Nombre de jobs"
                                    color="#3b82f6"
                                    height={300}
                                />
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Liste des nœuds */}
            {stats?.nodes && (
                <Card className="border border-gray-200 dark:border-gray-700">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            <Server className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Liste des nœuds ({filteredNodes.length} sur {allNodes.length})
                            </h3>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 mb-4">
                            <div className="xl:col-span-3">
                                <input
                                    type="text"
                                    placeholder="Rechercher des nœuds..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="px-3 py-2 border rounded-md w-full text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div className="xl:col-span-2">
                                <Select
                                    value={statusFilter}
                                    onValueChange={(v) => {
                                        setStatusFilter(v as 'all' | 'enabled' | 'disabled');
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectItem value="all">Statut: Tous</SelectItem>
                                    <SelectItem value="enabled">Activés</SelectItem>
                                    <SelectItem value="disabled">Désactivés</SelectItem>
                                </Select>
                            </div>
                            <div className="xl:col-span-3">
                                <Select
                                    value={projectFilter}
                                    onValueChange={(v) => {
                                        setProjectFilter(v);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectItem value="all">Projet: Tous</SelectItem>
                                    {[...new Map(
                                        (allNodes.flatMap((n) => n.projects || []) as ProjectDTO[]).map((p) => [p.id, p])
                                    ).values()].map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                    ))}
                                </Select>
                            </div>
                            <div className="xl:col-span-2">
                                <div className="flex gap-2">
                                    <Select
                                        value={sortBy}
                                        onValueChange={(v) => {
                                            setSortBy(v as 'name' | 'createdAt' | 'updatedAt' | 'jobs');
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <SelectItem value="name">Trier: Nom</SelectItem>
                                        <SelectItem value="createdAt">Trier: Créé le</SelectItem>
                                        <SelectItem value="updatedAt">Trier: Mis à jour</SelectItem>
                                        <SelectItem value="jobs">Trier: Jobs</SelectItem>
                                    </Select>
                                    <Select
                                        value={sortOrder}
                                        onValueChange={(v) => {
                                            setSortOrder(v as 'asc' | 'desc');
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <SelectItem value="asc">Asc</SelectItem>
                                        <SelectItem value="desc">Desc</SelectItem>
                                    </Select>
                                </div>
                            </div>
                            <div className="xl:col-span-2 flex items-center gap-2">
                                <Select
                                    value={String(itemsPerPage)}
                                    onValueChange={(v) => {
                                        setItemsPerPage(parseInt(v));
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectItem value="4">4 / page</SelectItem>
                                    <SelectItem value="8">8 / page</SelectItem>
                                    <SelectItem value="12">12 / page</SelectItem>
                                    <SelectItem value="20">20 / page</SelectItem>
                                </Select>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setStatusFilter('all');
                                        setOsFilter('all');
                                        setProjectFilter('all');
                                        setSortBy('name');
                                        setSortOrder('asc');
                                        setItemsPerPage(8);
                                        setCurrentPage(1);
                                    }}
                                >
                                    Réinitialiser
                                </Button>
                            </div>
                        </div>

                        {/* Pagination contrôles */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                Page {Math.min(currentPage, totalPages)} sur {totalPages}
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={currentPage <= 1}
                                    onClick={() => goToPage(currentPage - 1)}
                                    className="flex items-center gap-1"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Précédent
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => goToPage(currentPage + 1)}
                                    className="flex items-center gap-1"
                                >
                                    Suivant
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {Array.from({ length: itemsPerPage }).map((_, i) => (
                                    <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
                                        <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredNodes.length === 0 ? (
                            <div className="py-10 text-center text-sm text-gray-600 dark:text-gray-300">
                                Aucun nœud trouvé avec les critères actuels.
                                <div className="mt-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setStatusFilter('all');
                                            setOsFilter('all');
                                            setProjectFilter('all');
                                            setSortBy('name');
                                            setSortOrder('asc');
                                            setItemsPerPage(8);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        Réinitialiser les filtres
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {paginatedNodes.map((node) => (
                                <div
                                    key={node.id}
                                    onClick={() => openEditModal(node)}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all bg-white dark:bg-gray-900 group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-start space-x-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                                <Server className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                                                    {node.nodename}
                                                    <Badge variant="info" size="sm" className="ml-2">
                                                        <Briefcase className="h-3.5 w-3.5 mr-1" />
                                                        {(jobsMap[node.nodename] ?? 0)} jobs
                                                    </Badge>
                                                    {node.tags && (
                                                        <span className="ml-2 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                                                    {node.tags}
                                                </span>
                                                    )}
                                                </h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                                    <MonitorSmartphone className="h-4 w-4 mr-1" />
                                                    Hôte : {node.hostname}
                                                    <UserIcon className="h-4 w-4 ml-2 mr-1" />
                                                    Utilisateur : {node.username}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={getStatusBadge(node.enabled)}>
                                            {node.enabled ? (
                                                <>
                                                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                                                    Activé
                                                </>
                                            ) : (
                                                <>
                                                    <XCircleIcon className="h-4 w-4 mr-1" />
                                                    Désactivé
                                                </>
                                            )}
                                        </Badge>
                                    </div>

                                    <div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300 pl-11">
                                        <div className="flex items-center">
                                            <Cpu className="h-4 w-4 mr-2 text-gray-500" />
                                            <p>OS : {node.osFamily ?? "N/A"} / {node.osName ?? "?"} / {node.osArch ?? "?"}</p>
                                        </div>
                                        {node.description && (
                                            <div className="flex">
                                                <Info className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                                                <p>Description : {node.description}</p>
                                            </div>
                                        )}
                                        <div className="flex items-center">
                                            <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                            Créé : {formatDate(node.createdAt)}
                                        </div>
                                        <div className="flex items-center">
                                            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                            Mis à jour : {formatDate(node.updatedAt)}
                                        </div>
                                    </div>

                                    {node.sshPath && (
                                        <div
                                            onClick={() => navigate(`/ssh-paths/${node.sshPath.id}`)}
                                            className="mt-3 text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
                                        >
                                            <div className="flex items-center font-semibold mb-1">
                                                <Key className="h-4 w-4 mr-2" />
                                                Configuration SSH :
                                            </div>
                                            <ul className="space-y-1 pl-6">
                                                <li className="flex items-center">
                                                    <Fingerprint className="h-3.5 w-3.5 mr-2 opacity-70" />
                                                    Type de clé : {node.sshPath.keyType}
                                                </li>
                                                <li className="flex items-center">
                                                    <Share2 className="h-3.5 w-3.5 mr-2 opacity-70" />
                                                    Port SSH : {node.sshPath.sshPort}
                                                </li>
                                                <li className="flex items-center">
                                                    <Database className="h-3.5 w-3.5 mr-2 opacity-70" />
                                                    Stockage de la clé : {node.sshPath.keyStorage}
                                                </li>
                                                <li className="flex items-center">
                                                    <Tag className="h-3.5 w-3.5 mr-2 opacity-70" />
                                                    Nom de la clé : {node.sshPath.nameKeyPrivate}
                                                </li>
                                            </ul>
                                        </div>
                                    )}

                                    {node.projects?.length > 0 && (
                                        <div className="mt-3 text-sm text-gray-800 dark:text-gray-200">
                                            <div className="flex items-center font-semibold mb-1">
                                                <Folder className="h-4 w-4 mr-2" />
                                                Projets :
                                            </div>
                                            <ul className="space-y-1 pl-6">
                                                {node.projects.map((project) => (
                                                    <li key={project.id}
                                                        className="flex items-center"
                                                        onClick={() => navigate(`/projects/${project.id}`)}
                                                    >
                                                        <FolderOpen className="h-3.5 w-3.5 mr-2 opacity-70" />
                                                        <span className="font-medium">{project.name}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    <div className="mt-4 flex space-x-2 pl-11">
                                        <Button
                                            size="sm"
                                            className="flex-1"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/commands?project=${node.projects[0]?.name}&node=${encodeURIComponent(node.nodename)}`);
                                            }}
                                        >
                                            <Terminal className="h-4 w-4 mr-2" />
                                            Commande
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(node.id);
                                            }}
                                        >
                                            <Trash className="h-4 w-4 mr-2 text-red-500" />
                                            Supprimer
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Formulaire de création / édition */}
            {isCreateModalOpen && (
                <Dialog open={isCreateModalOpen} onOpenChange={closeModal}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                            <DialogTitle>
                                {isEditMode ? "Modifier le nœud" : "Créer un nouveau nœud"}
                            </DialogTitle>
                        </DialogHeader>

                        <DialogContent>
                            <form onSubmit={handleSubmitNode} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Nom du nœud */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Nom du nœud <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={nodeName}
                                            onChange={(e) => setNodeName(e.target.value)}
                                            required
                                            className="mt-1 block w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm dark:text-white"
                                        />
                                    </div>

                                    {/* Nom d'hôte */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Nom d'hôte <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={hostname}
                                            onChange={(e) => setHostname(e.target.value)}
                                            required
                                            className="mt-1 block w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm dark:text-white"
                                        />
                                    </div>

                                    {/* Nom d'utilisateur */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Nom d'utilisateur <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                            className="mt-1 block w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm dark:text-white"
                                        />
                                    </div>

                                    {/* Famille d'OS */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Famille d'OS
                                        </label>
                                        <input
                                            type="text"
                                            value={osFamily}
                                            onChange={(e) => setOsFamily(e.target.value)}
                                            className="mt-1 block w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm dark:text-white"
                                        />
                                    </div>

                                    {/* Nom de l'OS */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Nom de l'OS
                                        </label>
                                        <input
                                            type="text"
                                            value={osName}
                                            onChange={(e) => setOsName(e.target.value)}
                                            className="mt-1 block w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm dark:text-white"
                                        />
                                    </div>

                                    {/* Architecture OS */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Architecture OS
                                        </label>
                                        <input
                                            type="text"
                                            value={osArch}
                                            onChange={(e) => setOsArch(e.target.value)}
                                            className="mt-1 block w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm dark:text-white"
                                        />
                                    </div>

                                    {/* Étiquettes */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Étiquettes
                                        </label>
                                        <input
                                            type="text"
                                            value={tags}
                                            onChange={(e) => setTags(e.target.value)}
                                            className="mt-1 block w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm dark:text-white"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Description
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={3}
                                            className="mt-1 block w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* Sélection du chemin SSH */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Chemin SSH <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedSshPathId ?? ""}
                                        onChange={(e) => setSelectedSshPathId(parseInt(e.target.value))}
                                        className="mt-1 block w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm dark:text-white"
                                        required
                                    >
                                        <option value="">-- Sélectionner le chemin SSH --</option>
                                        {sshPaths.map((path) => (
                                            <option key={path.id} value={path.id}>
                                                {path.nameKeyPrivate} ({path.keyStorage})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Affecter aux projets */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Assigner aux projets
                                    </label>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {projects.map((project) => (
                                            <label key={project.id} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    value={project.id}
                                                    checked={selectedProjectIds.includes(project.id)}
                                                    onChange={() => toggleProjectSelection(project.id)}
                                                    className="form-checkbox h-4 w-4 text-indigo-600"
                                                />
                                                <span className="text-sm text-gray-900 dark:text-gray-200">
                                                    {project.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Boutons d'action */}
                                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <Button type="button" variant="outline" onClick={closeModal}>
                                        Annuler
                                    </Button>
                                    <Button type="submit">
                                        {isEditMode ? "Mettre à jour le nœud" : "Créer le nœud"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </div>
                </Dialog>
            )}
        </div>
    );
};