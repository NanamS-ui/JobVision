// pages/ServiceDetail.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import {
    ClipboardList,
    Clock,
    FolderKanban,
    Star,
    Loader2,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { useNavigate, useParams } from "react-router-dom";
import { ServiceDetailsDTO } from "../types/ServiceDetailsDTO.ts";
import { fetchServiceDetails } from "../api/serviceApi.ts";
import { Badge } from '../components/ui/Badge';

export const ServiceDetail: React.FC = () => {
    useEffect(() => {
        document.title = "Détails du Service - JobVision";
    }, []);
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<ServiceDetailsDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

    const formatDate = useCallback((dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        }).format(date);
    }, []);

    const toggleProjectExpansion = useCallback((projectId: number) => {
        setExpandedProjects(prev => ({
            ...prev,
            [projectId]: !prev[projectId]
        }));
    }, []);

    useEffect(() => {
        if (!id) {
            setError("L'identifiant du service est requis");
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        const { signal } = controller;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetchServiceDetails(Number(id));

                if (!signal.aborted) {
                    setData(response);
                    setExpandedProjects(
                        response.projects.reduce((acc, project) => ({
                            ...acc,
                            [project.id]: true
                        }), {})
                    );
                }
            } catch (err) {
                if (!signal.aborted) {
                    // Gérer l'erreur spécifique de l'API
                    const errorMessage = err instanceof Error ? err.message : "Échec du chargement des détails du service";
                    if (errorMessage.includes('Internal server error') && errorMessage.includes('datesNode') && errorMessage.includes('null')) {
                        setError('Aucune donnée disponible pour ce service');
                    } else {
                        setError(errorMessage);
                    }
                }
            } finally {
                if (!signal.aborted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => controller.abort();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span className="text-gray-600 dark:text-gray-400 animate-pulse">
                    Chargement des données...
                </span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <div className="text-gray-400 dark:text-gray-500 text-6xl">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                    Aucune donnée disponible
                </h3>
                <p className="text-gray-500 dark:text-gray-500 text-center max-w-md">
                    Aucune donnée de service n'est disponible pour ce service. 
                    L'API n'a pas pu récupérer les détails du service.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                    Vérifiez que l'identifiant du service est correct ou essayez de revenir à la liste des services.
                </p>
                <button
                    onClick={() => navigate('/services')}
                    className="mt-3 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    Retour aux services
                </button>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <div className="text-gray-400 dark:text-gray-500 text-6xl">📊</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                    Aucune donnée disponible
                </h3>
                <p className="text-gray-500 dark:text-gray-500 text-center max-w-md">
                    Aucune donnée de service n'est disponible pour ce service.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                    Le service pourrait ne pas avoir de données ou l'identifiant pourrait être incorrect.
                </p>
                <button
                    onClick={() => navigate('/services')}
                    className="mt-3 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    Retour aux services
                </button>
            </div>
        );
    }

    const { service, projects } = data;

    return (
        <div className="space-y-8">
            {/* En-tête Service modernisé et compact */}
            <div className="relative mb-6 rounded-2xl overflow-hidden shadow bg-gradient-to-br from-emerald-50/80 via-white/90 to-green-50/80 dark:from-emerald-950/60 dark:via-gray-900/80 dark:to-green-950/60 border border-emerald-100 dark:border-emerald-900">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-5 py-5">
                    <div className="flex items-center gap-4">
                        {/* Icône supprimée */}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                                {service.name}
                                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200 shadow-sm">
                                    Service
                                </span>
                            </h1>
                            {service.description && (
                                <p className="mt-1 text-gray-700 dark:text-gray-300 max-w-2xl text-sm">
                                    {service.description}
                                </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="info">
                                    {projects.length} {projects.length === 1 ? "Projet" : "Projets"}
                                </Badge>
                                <Badge variant="success">Actif</Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Dernière mise à jour : {formatDate(new Date().toISOString())}
                        </div>
                        <button
                            onClick={() => navigate('/services')}
                            className="mt-1 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded-lg font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors shadow text-sm"
                        >
                            ← Retour aux services
                        </button>
                    </div>
                </div>
            </div>

            {/* Section Projets modernisée */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                    <FolderKanban className="w-7 h-7 text-indigo-500" /> Vue d'ensemble des projets
                </h2>
                {projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <Card
                                key={project.id}
                                className={"relative bg-white dark:bg-gray-900 border-2 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-gray-200 dark:border-gray-700"}
                            >
                                <CardHeader
                                    className="p-5 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/30 rounded-t-2xl cursor-pointer transition-colors"
                                    onClick={() => toggleProjectExpansion(project.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 line-clamp-1 flex items-center gap-2">
                                                    {project.name}
                                                </h3>
                                                <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    <Badge variant="default">Créé : {formatDate(project.dateCreated)}</Badge>
                                                    <Badge variant="default">Maj : {formatDate(project.lastUpdated)}</Badge>
                                                    <Badge variant="info">{project.jobs?.length || 0} Tâches</Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors">
                                            {expandedProjects[project.id] ? (
                                                <ChevronUp className="w-6 h-6" />
                                            ) : (
                                                <ChevronDown className="w-6 h-6" />
                                            )}
                                        </button>
                                    </div>
                                </CardHeader>
                                <div className={`transition-all duration-500 ease-in-out ${expandedProjects[project.id] ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                    {expandedProjects[project.id] && (
                                        <CardContent className="p-5 pt-0 border-t border-gray-200 dark:border-gray-700">
                                            {project.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 italic">
                                                    {project.description}
                                                </p>
                                            )}
                                            {/* Section Tâches modernisée */}
                                            <div className="mt-3">
                                                <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                                    <ClipboardList className="w-4 h-4 text-blue-500" />
                                                    <span>Tâches du projet</span>
                                                    <span className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full">
                                                        {project.jobs?.length || 0}
                                                    </span>
                                                </h4>
                                                {project.jobs && project.jobs.length > 0 ? (
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {project.jobs.map((job) => (
                                                            <Card
                                                                key={job.id}
                                                                className="bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors rounded-xl"
                                                            >
                                                                <CardHeader className="p-4 pb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                                                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/jobs/${job.id}`)}>
                                                                        <ClipboardList className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                                                        <div>
                                                                            <h5 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                                                                                {job.name}
                                                                            </h5>
                                                                            {job.description && (
                                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                                                    {job.description}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-col md:items-end gap-2 mt-2 md:mt-0">
                                                                        <div className="flex gap-2 flex-wrap">
                                                                            <Badge variant={job.executionEnabled ? 'success' : 'default'}>
                                                                                {job.executionEnabled ? 'Actif' : 'Inactif'}
                                                                            </Badge>
                                                                            <Badge variant={job.scheduleEnabled ? 'info' : 'default'}>
                                                                                {job.scheduleEnabled ? 'Planifié' : 'Manuel'}
                                                                            </Badge>
                                                                            {job.priority && (
                                                                                <Badge variant="warning" className="flex items-center gap-1">
                                                                                    <Star className="w-3 h-3" /> Prioritaire
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        {job.cronExpression && (
                                                                            <div className="flex items-center gap-2 text-xs mt-1">
                                                                                <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                                                                <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-900 dark:text-gray-100 font-mono">
                                                                                    {job.cronExpression}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </CardHeader>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-6 text-center">
                                                        <p className="text-gray-500 dark:text-gray-400">
                                                            Aucune tâche configurée pour ce projet
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-gray-50 dark:bg-gray-800/30 border border-dashed border-gray-300 dark:border-gray-700">
                        <CardContent className="p-8 text-center">
                            <FolderKanban className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-1">
                                Aucun projet trouvé
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                Ce service n'a pas encore de projets. Créez-en un pour commencer.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </section>
        </div>
    );
};