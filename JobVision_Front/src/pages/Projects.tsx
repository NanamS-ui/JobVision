import React, {useEffect, useMemo, useState} from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {FolderOpen, Calendar, Play, CheckCircle, Trash2, ChevronLeft, ChevronRight} from 'lucide-react';
import {autocompleteProjects, createProject, deleteProject, getProjectStats} from '../api/projectApi.ts';
import { ProjectStats } from '../types/ProjectStats.ts';
import { ProjectStatsViewDTO } from "../types/ProjectStatsViewDTO.ts";
import { JobDTO } from "../types/JobDTO.ts";
import {fetchAllServices} from "../api/serviceApi.ts";
import PopupMessage from "../components/pop-up/PopupMessage.tsx";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "../components/ui/Dialog.tsx";
import {fetchNodes, fetchNodesByProjectName} from "../api/nodeApi.ts";

export const Projects: React.FC = () => {
    useEffect(() => {
        document.title = "Projets - JobVision";
    }, []);

    const [stats, setStats] = useState<ProjectStats | null>(null);

    useEffect(() => {
        getProjectStats()
            .then(data => setStats(data))
            .catch(err => console.error(err));
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DISABLED':
                return 'info';
            case 'ENABLED':
                return 'success';
            case 'on-hold':
                return 'warning';
            default:
                return 'default';
        }
    };

    const departments = stats
        ? [
            {
                id: 1,
                name: 'Total Projets',
                memberCount: stats.totalProjects,
                color: '#3b82f6',
                icon: <FolderOpen className="h-6 w-6" style={{ color: '#3b82f6' }} />,
            },
            {
                id: 2,
                name: 'Total Exécutions',
                memberCount: stats.totalExecutions,
                color: '#6366f1',
                icon: <Play className="h-6 w-6" style={{ color: '#6366f1' }} />,
            },
            {
                id: 3,
                name: 'Taux de réussite (%)',
                memberCount: stats.successRatePercent.toFixed(2),
                color: '#10b981',
                icon: <CheckCircle className="h-6 w-6" style={{ color: '#10b981' }} />,
            },
            {
                id: 4,
                name: 'Durée Moyenne d\'Exécution (s)',
                memberCount: stats.avgExecutionDurationSec.toFixed(2),
                color: '#8b5cf6',
                icon: <Calendar className="h-6 w-6" style={{ color: '#8b5cf6' }} />,
            },
        ]
        : [];

    const openModal = () => setIsCreateModalOpen(true);
    const closeModal = () => setIsCreateModalOpen(false);
    const [services, setServices] = useState<{ id: number; name: string }[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [allNodes, setAllNodes] = useState<{ nodename: string; hostname: string }[]>([]);
    const [selectedNodeNames, setSelectedNodeNames] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        fetchAllServices()
            .then(data => setServices(data))
            .catch(err => console.error('Erreur fetchAllServices:', err));
    }, []);

    useEffect(() => {
        fetchNodes()
            .then(setAllNodes)
            .catch(err => console.error('Erreur fetchNodes:', err));
    }, []);

    const [popup, setPopup] = useState<{
        message: string;
        type: 'success' | 'error' | 'info';
    } | null>(null);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newProjectName || !selectedServiceId) {
            setPopup({ message: 'Veuillez renseigner tous les champs obligatoires.', type: 'error' });
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await createProject(
                newProjectName,
                newProjectDescription,
                selectedServiceId,
                selectedNodeNames
            );
            await new Promise(resolve => setTimeout(resolve, 4000));
            if ('data' in response) {
                setNewProjectName('');
                setNewProjectDescription('');
                setSelectedServiceId(null);
                setSelectedNodeNames([]);
                closeModal();
                setPopup({ message: 'Projet créé avec succès. Veuillez patienter quelques secondes…', type: 'success' });
                await new Promise(resolve => setTimeout(resolve, 4000));
                const projectStats = await getProjectStats();
                setStats(projectStats);
            } else {
                setPopup({ message: 'Erreur lors de la création du projet.', type: 'error' });
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Erreur inconnue lors de la création du projet';
            setPopup({ message: errorMessage, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProject = async (name: string) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le projet "${name}" ?`)) {
            try {
                await deleteProject(name);

                setPopup({
                    message: "Projet supprimé avec succès !",
                    type: "info"
                });

                const projectStats = await getProjectStats();
                setStats(projectStats);
            } catch (error) {
                console.error("Échec de la suppression du projet :", error);

                setPopup({
                    message: "Erreur lors de la suppression du projet : " + (error instanceof Error ? error.message : String(error)),
                    type: "error"
                });
            }
        }
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [suggestions, setSuggestions] = useState<any[]>([]);
    const itemsPerPage = 3;

    // Détails projet (modal)
    const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
    const [detailsProjectName, setDetailsProjectName] = useState<string>('');
    const [detailsNodes, setDetailsNodes] = useState<any[]>([]);
    const [detailsJobs, setDetailsJobs] = useState<JobDTO[]>([]);
    const [detailsLoading, setDetailsLoading] = useState<boolean>(false);

    const openProjectDetails = async (projectName: string, jobs: JobDTO[]) => {
        setDetailsProjectName(projectName);
        setDetailsJobs(jobs || []);
        setIsDetailsOpen(true);
        setDetailsLoading(true);
        try {
            const nodes = await fetchNodesByProjectName(projectName);
            setDetailsNodes(nodes);
        } catch (e) {
            console.error('Erreur chargement des nœuds du projet', e);
            setDetailsNodes([]);
        } finally {
            setDetailsLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const fetchSuggestions = async () => {
                const trimmed = searchQuery.trim();
                if (trimmed.length < 2) {
                    setSuggestions([]);
                    return;
                }
                try {
                    const response = await autocompleteProjects(trimmed);
                    setSuggestions(response || []);

                } catch (error) {
                    console.error('Erreur autocomplétion :', error);
                    setSuggestions([]);
                }
            };

            fetchSuggestions();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const filteredProjects = useMemo(() => {
        if (searchQuery.trim().length >= 2) {
            return suggestions;
        }
        return stats?.projects ?? [];
    }, [searchQuery, suggestions, stats?.projects]);

    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const paginatedProjects = filteredProjects.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
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
                    position={"top-center"}
                    showIcon={true}
                    animated={true}
                />
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestion des projets</h1>
                    <p className="text-gray-600 dark:text-gray-400">Coordonner les projets entre départements et suivre leur avancement</p>
                </div>

                <Button onClick={openModal} variant="primary">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Nouveau projet
                </Button>
            </div>

            {/* Vue d’ensemble des départements */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {departments.map(dept => (
                    <Card key={dept.id} hoverable>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: `${dept.color}20` }}>
                                    {dept.icon}
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{dept.name}</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{dept.memberCount}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Projets actifs */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Projets actifs</h3>
                        <Badge variant="info">{stats?.projects?.length ?? 0} projets</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <input
                            type="text"
                            placeholder="Rechercher un projet..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1); // reset page lors de la recherche
                            }}
                            className="px-3 py-2 border rounded-md w-1/2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        />
                        {searchQuery.trim().length < 2 && (
                            <div className="flex space-x-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={currentPage === 1}
                                    onClick={() => goToPage(currentPage - 1)}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Précédent
                                </Button>
                                <span className="text-sm text-gray-700 dark:text-gray-300 self-center">
                                  Page {currentPage} sur {totalPages}
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={currentPage === totalPages}
                                    onClick={() => goToPage(currentPage + 1)}
                                >
                                    Suivant
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {(searchQuery.trim().length >= 2
                                ? suggestions // si recherche, affiche toutes les suggestions (sans pagination)
                                : paginatedProjects // sinon affiche projets paginés
                        ).map((project: ProjectStatsViewDTO) => {
                            const projectData = project.project ?? {};
                            const jobs = project.jobs ?? [];
                            // const progress = project.progress ?? 0;

                            return (
                                <div
                                    key={projectData.id ?? Math.random()}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                    {projectData.name ?? 'Projet sans nom'}
                                                </h4>
                                                <Badge variant={getStatusBadge(projectData.state ?? 'INCONNU')}>
                                                    {projectData.state ?? 'Inconnu'}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    Créé le{' '}
                                                    {projectData.dateCreated
                                                        ? new Date(projectData.dateCreated).toLocaleDateString('fr-FR', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                        }) +
                                                        ' ' +
                                                        new Date(projectData.dateCreated).toLocaleTimeString('fr-FR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })
                                                        : 'date inconnue'}
                                                </div>
                                                <div className="flex items-center">
                                                    <Play className="h-4 w-4 mr-1" />
                                                    {jobs.length} jobs récents
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                {/*<div className="flex justify-between text-sm mb-1">*/}
                                                {/*    <span className="text-gray-600 dark:text-gray-400">Progression</span>*/}
                                                {/*    <span className="text-gray-900 dark:text-gray-100">{progress.toFixed(2)}%</span>*/}
                                                {/*</div>*/}
                                                {/*<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">*/}
                                                {/*    <div*/}
                                                {/*        className="bg-primary-600 h-2 rounded-full transition-all duration-300"*/}
                                                {/*        style={{ width: `${progress}%` }}*/}
                                                {/*    ></div>*/}
                                                {/*</div>*/}
                                            </div>

                                            <div>
                                                <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Jobs récents</h5>
                                                <div className="space-y-2">
                                                    {jobs.slice(0, 2).map((job: JobDTO) => (
                                                        <div
                                                            key={job.id ?? Math.random()}
                                                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <div
                                                                    className={`w-2 h-2 rounded-full ${
                                                                        job.logLevel === 'INFO'
                                                                            ? 'bg-green-500'
                                                                            : job.logLevel === 'WARN'
                                                                                ? 'bg-yellow-500'
                                                                                : job.logLevel === 'ERROR'
                                                                                    ? 'bg-red-500'
                                                                                    : 'bg-gray-500'
                                                                    }`}
                                                                ></div>
                                                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                                                  {job.name ?? 'Nom non défini'}
                                                                </span>
                                                            </div>
                                                            <Badge size="sm" variant="default">
                                                                {job.logLevel ?? 'INFO'}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex space-x-2 ml-4">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    if (projectData.name !== undefined) {
                                                        openProjectDetails(projectData.name, jobs);
                                                    }
                                                }}
                                            >
                                                Voir
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                onClick={() => {
                                                    if (projectData.name !== undefined) {
                                                        handleDeleteProject(projectData.name);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {isCreateModalOpen && (
                <Dialog open={isCreateModalOpen} onOpenChange={closeModal}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Créer un nouveau projet</DialogTitle>
                        </DialogHeader>

                        <DialogContent>
                            <form onSubmit={handleCreateProject} className="space-y-4">
                                <div>
                                    <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Nom du projet
                                    </label>
                                    <input
                                        id="projectName"
                                        type="text"
                                        value={newProjectName}
                                        onChange={e => setNewProjectName(e.target.value)}
                                        required
                                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Description
                                    </label>
                                    <textarea
                                        id="projectDescription"
                                        value={newProjectDescription}
                                        onChange={e => setNewProjectDescription(e.target.value)}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100"
                                    />
                                </div>

                                {/* Sélection d’un seul service */}
                                <div>
                                    <label htmlFor="serviceSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Sélectionner un service
                                    </label>
                                    <select
                                        id="serviceSelect"
                                        value={selectedServiceId ?? ''}
                                        onChange={e => setSelectedServiceId(parseInt(e.target.value))}
                                        size={6} // <-- affiche 6 éléments visibles
                                        className="block w-full max-h-40 overflow-y-auto rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="">-- Sélectionnez un service --</option>
                                        {services.map(service => (
                                            <option key={service.id} value={service.id}>
                                                {service.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Sélection de nœuds (optionnelle, multi-sélection) */}
                                <div>
                                    <label htmlFor="nodesSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Sélectionner des nœuds (optionnel)
                                    </label>
                                    <select
                                        id="nodesSelect"
                                        multiple
                                        value={selectedNodeNames}
                                        onChange={(e) => {
                                            const options = Array.from(e.target.selectedOptions);
                                            setSelectedNodeNames(options.map(o => o.value));
                                        }}
                                        size={8}
                                        className="block w-full max-h-60 overflow-y-auto rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100"
                                    >
                                        {allNodes.map(n => (
                                            <option key={n.nodename} value={n.nodename}>
                                                {n.nodename} ({n.hostname})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <Button type="button" variant="outline" onClick={closeModal}>
                                        Annuler
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Création en cours…' : 'Créer'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </div>
                </Dialog>
            )}

            {isDetailsOpen && (
                <Dialog open={isDetailsOpen} onOpenChange={() => setIsDetailsOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Détails du projet: {detailsProjectName}</DialogTitle>
                        </DialogHeader>
                        <DialogContent>
                            {detailsLoading ? (
                                <div className="text-sm text-gray-600 dark:text-gray-300">Chargement…</div>
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Nœuds</h5>
                                        {detailsNodes.length === 0 ? (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Aucun nœud associé.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {detailsNodes.map((n: any) => (
                                                    <div key={`${n.nodename}-${n.hostname}`} className="p-2 bg-gray-50 dark:bg-gray-700 rounded flex justify-between">
                                                        <span className="text-sm text-gray-900 dark:text-gray-100">{n.nodename}</span>
                                                        <span className="text-xs text-gray-600 dark:text-gray-300">{n.hostname}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Jobs récents</h5>
                                        {detailsJobs.length === 0 ? (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Aucun job récent.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {detailsJobs.map((job: JobDTO) => (
                                                    <div key={job.id ?? Math.random()} className="p-2 bg-gray-50 dark:bg-gray-700 rounded flex justify-between items-center">
                                                        <span className="text-sm text-gray-900 dark:text-gray-100">{job.name ?? 'Nom non défini'}</span>
                                                        <Badge size="sm" variant="default">{job.logLevel ?? 'INFO'}</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                                <Button type="button" variant="outline" onClick={() => setIsDetailsOpen(false)}>
                                    Fermer
                                </Button>
                            </div>
                        </DialogContent>
                    </div>
                </Dialog>
            )}

        </div>
    );
};
