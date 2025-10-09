import React, {useEffect, useRef, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
    List, Play, Square, RotateCcw, Trash2, Edit, Eye, Search,
    Plus, Activity, CheckCircle, XCircle,
    Download, Loader2, Clock
} from 'lucide-react';
import { usePopup } from "../components/pop-up/PopupProviderProps.tsx";
import {JobStateDTO} from "../types/JobState.ts";
import {
    autocompleteJobs, deleteJobById,
    exportJob,
    getJobCounts,
    getProgressForRunningJobs,
    runJobWithOptions,
    stopJob
} from "../api/jobApi.ts";
import { ServiceDTO } from '../types/Service.ts';
import {fetchAllServices} from "../api/serviceApi.ts";
import {ProjectDTO} from "../types/ProjectDTO.ts";
import {fetchProjectsByService} from "../api/projectApi.ts";
import {JobStatsListDTO} from "../types/jobStatsListDTO.ts";
import {chunkArray} from "../utils/function.ts";
import {Popover, PopoverContent, PopoverTrigger} from '../components/ui/Popover.tsx';
import {fetchOptionsByJobId} from "../api/optionApi.ts";
import {OptionDTO} from "../types/OptionDTO.ts";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "../components/ui/Dialog.tsx";

export const JobList: React.FC = () => {
    useEffect(() => {
        document.title = "Liste des Job - JobVision";
    }, []);
    const { showPopup } = usePopup();
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const navigate = useNavigate();
    const [availableOptions, setAvailableOptions] = useState<OptionDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const numberFormatter = new Intl.NumberFormat("de-DE", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'En cours': return 'info';
            case 'Réussi': return 'success';
            case 'Échoué': return 'error';
            case 'En attente': return 'warning';
            case 'Annulé': return 'warning';
            default: return 'default';
        }
    };

    const [jobCounts, setJobCounts] = useState<JobStateDTO>({
        totalJobs: 0,
        runningJobs: 0,
        successfulJobs: 0,
        failedJobs: 0,
        jobStats: [],
    });

    const jobCountsRef = useRef(jobCounts);
    useEffect(() => {
        jobCountsRef.current = jobCounts;
    }, [jobCounts]);

// Initial load
    useEffect(() => {
        getJobCounts()
            .then(setJobCounts)
            .catch((err) => console.error("Error fetching job counts", err));
    }, []);

    console.log(jobCounts);
    const refreshJobCounts = () => {
        getJobCounts()
            .then(setJobCounts)
            .catch((err) => console.error("Error fetching job counts", err));
    };

    const BATCH_SIZE = Number(import.meta.env.VITE_BATCH_SIZE) || 50;
    const STALL_DURATION_MS = Number(import.meta.env.VITE_STALL_DURATION_MS) || 30000;
    const progressCheck = Number(import.meta.env.VITE_PROGRESS_CHECK) || 3000

// Interval pour mettre à jour le progrès toutes les 3 secondes
    useEffect(() => {
        const intervalId = setInterval(async () => {
            const jobStats = jobCountsRef.current.jobStats;
            if (!jobStats || jobStats.length === 0) return;

            const runningJobs = jobStats.filter(
                (j) => j.status === 'running' && j.executionIdRundeck
            );
            const executionIds = runningJobs.map((j) => j.executionIdRundeck!);

            if (executionIds.length === 0) return;

            try {
                const batches = chunkArray(executionIds, BATCH_SIZE);

                const allProgressResults = await Promise.all(
                    batches.map((batch) => getProgressForRunningJobs(batch))
                );

                const progressMap = Object.assign({}, ...allProgressResults);

                // On calcule ici le flag avant setState
                const foundCompleted = jobStats.some(job => {
                    if (job.status === 'running' && job.executionIdRundeck) {
                        const newProgress = progressMap[job.executionIdRundeck] ?? job.executionProgress;
                        return newProgress === 100;
                    }
                    return false;
                });

                setJobCounts((prev) => {
                    const updatedJobStats = prev.jobStats.map((job) => {
                        if (job.status === 'running' && job.executionIdRundeck) {
                            return {
                                ...job,
                                executionProgress: progressMap[job.executionIdRundeck] ?? job.executionProgress,
                            };
                        }
                        return job;
                    });

                    return { ...prev, jobStats: updatedJobStats };
                });

                if (foundCompleted) {
                    refreshJobCounts();
                }
            } catch (err) {
                console.error('Error updating progress', err);
            }
        }, progressCheck);

        return () => clearInterval(intervalId);
    }, []);

// Interval pour refreshJobCounts à chaque STALL_DURATION_MS
    useEffect(() => {
        const intervalId = setInterval(() => {
            refreshJobCounts();
        }, STALL_DURATION_MS);

        return () => clearInterval(intervalId);
    }, []);

    const statusData = [
        {
            key: "all",
            label: "Tous",
            count: numberFormatter.format(jobCounts.totalJobs),
            icon: <List className="h-5 w-5 text-primary-600" />,
            bg: "bg-primary-100 dark:bg-primary-900",
        },
        {
            key: "running",
            label: "En cours",
            count: numberFormatter.format(jobCounts.runningJobs),
            icon: <Activity className="h-4 w-4 text-blue-500 animate-spin" />,
            bg: "bg-blue-100 dark:bg-blue-900",
        },
        {
            key: "succeeded",
            label: "Réussis",
            count: numberFormatter.format(jobCounts.successfulJobs),
            icon: <CheckCircle className="h-4 w-4 text-green-500" />,
            bg: "bg-green-100 dark:bg-green-900",
        },
        {
            key: "failed",
            label: "Échoués",
            count: numberFormatter.format(jobCounts.failedJobs),
            icon: <XCircle className="h-4 w-4 text-red-500" />,
            bg: "bg-red-100 dark:bg-red-900",
        },
    ];

    const [departmentFilter, setDepartmentFilter] = useState<string>('all');
    const [projects, setProjects] = useState<ProjectDTO[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
    const [services, setServices] = useState<ServiceDTO[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [autocompleteResults, setAutocompleteResults] = useState<JobStatsListDTO[]>([]);
    const [selectedJob, setSelectedJob] = useState<{ idJob: number; jobName: string; action?: string } | null>(null);
    const [isStartModalOpen, setIsStartModalOpen] = useState(false);
    const [jobOptions, setJobOptions] = useState<{ [key: string]: any }>({});
    const [inputTypes, setInputTypes] = useState<{ [key: string]: 'text' | 'date' }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchAllServices()
            .then(setServices)
            .catch(err => console.error("Erreur chargement services:", err));
    }, []);

    useEffect(() => {
        if (departmentFilter !== 'all') {
            console.log("service : "+ departmentFilter)
            fetchProjectsByService(departmentFilter) // Passer le nom du service ici
                .then(projects => {
                    console.log("Projets chargés :", projects);
                    setProjects(projects);
                })
                .catch(err => console.error("Erreur chargement projets:", err));
        } else {
            setProjects([]);
            setSelectedProjectId('all');
            console.log("Filtre service à 'all', projets vidés");
        }
    }, [departmentFilter]);

    useEffect(() => {
        if (searchTerm.length >= 2) {
            autocompleteJobs(searchTerm)
                .then(results => {
                    setAutocompleteResults(results);

                    const exactMatch = results.find(job =>
                        job.jobName.toLowerCase() === searchTerm.toLowerCase()
                    );
                    if (exactMatch) {
                        setSearchTerm(exactMatch.jobName); // force l'affichage dans filteredJobs
                    }
                })
                .catch(err => {
                    console.error("Erreur autocomplete:", err);
                    setAutocompleteResults([]);
                });
        } else {
            setAutocompleteResults([]);
        }
    }, [searchTerm]);

    const filteredJobs = (
        searchTerm.length >= 2 && autocompleteResults.length > 0
            ? autocompleteResults
            : jobCounts.jobStats
    )?.filter(job => {
        const matchesSearch =
            searchTerm.length < 2 || job.jobName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
        const matchesDepartment = departmentFilter === 'all' || job.serviceName === departmentFilter;
        const matchesProject = selectedProjectId === 'all' || job.projectName === selectedProjectId;

        return matchesSearch && matchesStatus && matchesDepartment && matchesProject;
    }) ?? [];

    const handleJobAction = async (jobId: string, action: string) => {
        const jobB = filteredJobs.find(j => j.idJob === Number(jobId));
        if (!jobB) return;

        const jobName = jobB.jobName;

        const job = {
            idJob: jobB.idJob,
            jobName: jobB.jobName,
            action: action, // Ajouter l'action pour pouvoir l'utiliser dans le modal
        };

        switch (action) {
            case 'start':
            case 'restart':
                setSelectedJob(job);
                setIsStartModalOpen(true);
                break;

            case 'stop':
                if (!jobB.executionIdRundeck) return;

                try {
                    await stopJob(jobB.executionIdRundeck);
                    showPopup({
                        title: 'Job arrêté',
                        message: `Le job "${jobName}" a été arrêté`,
                        type: 'warning',
                        duration: 3000,
                    });
                    refreshJobCounts(); // mise à jour des données
                } catch (err) {
                    console.error("Erreur lors de l'arrêt du job", err);
                    showPopup({
                        title: 'Erreur',
                        message: `Impossible d'arrêter le job "${jobName}"`,
                        type: 'error',
                        duration: 3000,
                    });
                }
                break;

            case 'delete':
                { const confirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer le job «${jobName}» ? Cette action ne peut pas être annulée.`);
                if (!confirmed) return;

                try {
                    setLoading(true); // si tu veux afficher un spinner
                    await delay(3000);
                    const response = await deleteJobById(jobB.idJob);
                    showPopup({
                        title: 'Job supprimé',
                        message: response,
                        type: 'success',
                        duration: 3000,
                    });
                    await refreshJobCounts(); // faire le refresh après la pause
                } catch (err: any) {
                    console.error("Error while deleting job", err);
                    showPopup({
                        title: 'Error',
                        message: `Failed to delete the job "${jobName}".`,
                        type: 'error',
                        duration: 4000,
                    });
                } finally {
                    setLoading(false);
                }
                break; }

            default:
                console.warn(`Unhandled action: ${action}`);
                break;
        }
    };

    useEffect(() => {
        if (selectedJob) {
            fetchOptionsByJobId(selectedJob.idJob)
                .then((options) => {
                    setAvailableOptions(options);
                    // init state with default values
                    const defaults: Record<string, string> = {};
                    options.forEach((opt) => {
                        if (opt.defaultValue) {
                            defaults[opt.name] = opt.defaultValue;
                        }
                    });
                    setJobOptions(defaults);
                })
                .catch((err) => {
                    console.error('Erreur chargement options :', err);
                    setAvailableOptions([]);
                });
        }
    }, [selectedJob]);


    const [openExport, setOpenExport] = useState<number | null>(null); // Job ID pour lequel le menu est ouvert

    const handleExport = async (jobId: number, format: 'yaml' | 'xml' | 'json', jobName:string) => {
        try {
            const blob = await exportJob(jobId, format);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `job_${jobId}_${jobName}.${format}`;
            a.click();
            URL.revokeObjectURL(url);
            setOpenExport(null); // close popover
        } catch (error) {
            console.error('Export failed', error);
            alert('Export failed');
        }
    };

    const handleClose = () => {
        setIsStartModalOpen(false);
        setSelectedJob(null);
        setJobOptions({});
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Liste des Jobs
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gérez et surveillez tous vos jobs d'automatisation
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    <Button
                        variant="primary"
                        onClick={() => navigate('/jobs/create')}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nouveau job
                    </Button>
                </div>
            </div>

            {/* Status Overview */}
            <div className="flex justify-between gap-4 flex-wrap md:flex-nowrap">
                {statusData.map(({ key, label, count, icon, bg }) => {
                    const isSelected = statusFilter === key;
                    return (
                        <Card
                            key={key}
                            className={`flex-1 min-w-[180px] cursor-pointer transition-all duration-200 rounded-xl border ${
                                isSelected ? "bg-primary-50 dark:bg-primary-900/20 border-primary-500" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            }`}
                            onClick={() => setStatusFilter(key)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center">
                                    <div className={`p-2 rounded-lg ${bg}`}>
                                        {icon}
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                                            {label}
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {count}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Rechercher des jobs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />

                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Jobs ({filteredJobs.length})
                    </h3>

                    <div className="flex gap-4 flex-wrap">
                        {/* Filtre Service */}
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            <option value="all">Tous les services</option>
                            {services.map(service => (
                                <option key={service.id} value={service.name}>{service.name}</option>
                            ))}
                        </select>

                        {/* Filtre Projet */}
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            disabled={departmentFilter === 'all'}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            <option value="all">Tous les projets</option>
                            {projects && projects.length > 0 ? (
                                projects.map(project => (
                                    <option key={project.id} value={project.name}>{project.name}</option>
                                ))
                            ) : (
                                <option disabled>Aucun projet</option>
                            )}
                        </select>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredJobs.map(job => {
                            const statusMap: Record<string, string> = {
                                failed: 'Échoué',
                                succeeded: 'Réussi',
                                running: 'En cours',
                                pending: 'En attente',
                                aborted:'Annulé'
                            };

                            const displayStatus =
                                job.status === 'running' && job.executionProgress === 100
                                    ? statusMap['succeeded']
                                    : statusMap[job.status ?? 'pending'];
                            return (
                                <div
                                    key={job.idJob}
                                    className={`border rounded-lg p-4 shadow-sm dark:border-gray-700 transition-all cursor-pointer hover:shadow-md hover:scale-[1.02] bg-white dark:bg-gray-800`}
                                    onClick={() => navigate(`/jobs/${job.idJob}`)}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center space-x-2">
                                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{job.jobName}</h4>
                                            {job.scheduled && (
                                                <div className="flex items-center" title="Job planifié">
                                                    <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                </div>
                                            )}
                                        </div>
                                        <Badge variant={getStatusBadge(displayStatus) as any}>
                                            {displayStatus}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">ID : {job.idJob}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Service : {job.serviceName}</p>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 ${
                                                    job.status === 'failed'
                                                        ? 'bg-red-500'
                                                        : job.status === 'succeeded'
                                                            ? 'bg-green-500'
                                                            : 'bg-primary-600'
                                                }`}
                                                style={{ width: `${job.status === 'succeeded' ? 100 : job.executionProgress}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {job.executionProgress.toFixed(1)}%
                                          </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Durée : {numberFormatter.format(Number(job.durationMs))} ms</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Début : {job.dateStarted ? new Date(job.dateStarted).toLocaleString() : 'N/A'}
                                    </p>
                                    {/*{job.status === "failed" && (*/}
                                    {/*    <p className="text-sm text-gray-600 dark:text-gray-400">*/}
                                    {/*        Dernier succès : {job.dateLastSuccess ? new Date(job.dateLastSuccess).toLocaleString() : "N/A"}*/}
                                    {/*    </p>*/}
                                    {/*)}*/}

                                    {job.status === "succeeded" && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Dernier échec : {job.dateLastFailed ? new Date(job.dateLastFailed).toLocaleString() : "N/A"}
                                        </p>
                                    )}

                                    {job.last5Execution !== null && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            5 dernières exécutions : {numberFormatter.format(job.last5Execution)} ms
                                        </p>
                                    )}
                                    <div className="flex flex-wrap items-center space-x-1 mt-3">
                                        {job.status === 'running' && (
                                            <>
                                                <Button size="sm" variant="ghost" onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleJobAction(job.idJob.toString(), 'restart');
                                                }}>
                                                    <RotateCcw className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (job.executionIdRundeck != null) {
                                                            handleJobAction(job.idJob.toString(), 'stop');
                                                        }
                                                    }}
                                                    disabled={!job.executionIdRundeck}
                                                >
                                                    <Square className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                        {(job.status === 'succeeded') && (
                                            <Button size="sm" variant="ghost" onClick={(e) => {
                                                e.stopPropagation();
                                                handleJobAction(job.idJob.toString(), 'restart');
                                            }}>
                                                <Play className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {(job.status === 'failed') && (
                                            <Button size="sm" variant="ghost" onClick={(e) => {
                                                e.stopPropagation();
                                                handleJobAction(job.idJob.toString(), 'restart');
                                            }}>
                                                <RotateCcw className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {(job.status === 'aborted') && (
                                            <Button size="sm" variant="ghost" onClick={(e) => {
                                                e.stopPropagation();
                                                handleJobAction(job.idJob.toString(), 'restart');
                                            }}>
                                                <RotateCcw className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {job.status === null && (
                                            <Button size="sm" variant="ghost" onClick={(e) => {
                                                e.stopPropagation();
                                                handleJobAction(job.idJob.toString(), 'restart');
                                            }}>
                                                <Play className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button size="sm" variant="ghost" onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/jobs/${job.idJob}`);
                                        }}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/jobs/edit/${job.idJob}`);
                                            }}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleJobAction(job.idJob.toString(), 'delete');
                                            }}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>

                                        <Popover
                                            open={openExport === job.idJob}
                                            onOpenChange={(open) => setOpenExport(open ? job.idJob : null)}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-36 p-2 space-y-1">
                                                {['yaml', 'xml', 'json'].map((format) => (
                                                    <Button
                                                        key={format}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="w-full justify-start"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleExport(job.idJob, format as 'yaml' | 'xml' | 'json', job.jobName);
                                                        }}
                                                    >
                                                        {format.toUpperCase()}
                                                    </Button>
                                                ))}
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            );
                        })}

                        {filteredJobs.length === 0 && (
                            <div className="text-center py-8 col-span-full">
                                <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">Aucun job trouvé avec les filtres actuels</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {isStartModalOpen && selectedJob ? (
                <Dialog open={isStartModalOpen && !!selectedJob} onOpenChange={handleClose}>
                    <DialogHeader>
                        <DialogTitle>
                            {selectedJob?.action === 'restart' ? 'Redémarrer' : 'Démarrer'} le job&nbsp;: {selectedJob?.jobName}
                        </DialogTitle>
                    </DialogHeader>

                    <DialogContent>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setIsSubmitting(true);
                                try {
                                    await runJobWithOptions(selectedJob!.idJob, jobOptions);
                                    showPopup({
                                        title: selectedJob!.action === 'restart' ? 'Job démarré' : 'Job démarré',
                                        message: `Le job "${selectedJob!.jobName}" a été ${selectedJob!.action === 'restart' ? 'démarré' : 'démarré'} avec succès`,
                                        type: 'success',
                                        duration: 3000,
                                    });
                                    handleClose();
                                    refreshJobCounts();
                                } catch (err: any) {
                                    showPopup({
                                        title: 'Erreur',
                                        message: `Erreur lors du ${selectedJob!.action === 'restart' ? 'redémarrage' : 'démarrage'} du job: ${err.message}`,
                                        type: 'error',
                                        duration: 3000,
                                    });
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            className="space-y-4"
                        >
                            {availableOptions.length > 0 ? (
                                availableOptions.map((opt) => {
                                    const allowed = opt.allowedValues?.split(',') || [];
                                    const currentInputType = inputTypes[opt.name] || (opt.secure ? 'password' : 'text');

                                    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                        let value = e.target.value;
                                        // Si c'est un input de type date, convertir au format YYYY-MM-DD
                                        if (currentInputType === 'date') {
                                            const date = new Date(value);
                                            if (!isNaN(date.getTime())) {
                                                value = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
                                            }
                                        }
                                        setJobOptions({ ...jobOptions, [opt.name]: value });
                                    };

                                    const handleTypeChange = (newType: 'text' | 'date') => {
                                        setInputTypes({ ...inputTypes, [opt.name]: newType });
                                        // Réinitialiser la valeur quand on change de type
                                        setJobOptions({ ...jobOptions, [opt.name]: '' });
                                    };

                                    return (
                                        <div key={opt.id} className="mb-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {opt.name}
                                                    {opt.required && <span className="text-red-500 ml-1">*</span>}
                                                </label>
                                                {!opt.secure && allowed.length === 0 && (
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">Type:</span>
                                                        <select
                                                            value={currentInputType}
                                                            onChange={(e) => handleTypeChange(e.target.value as 'text' | 'date')}
                                                            className="text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100"
                                                        >
                                                            <option value="text">Texte</option>
                                                            <option value="date">Date</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                            {opt.description && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                    {opt.description}
                                                </p>
                                            )}
                                            {allowed.length > 0 ? (
                                                <select
                                                    value={jobOptions[opt.name] || ''}
                                                    onChange={(e) =>
                                                        setJobOptions({ ...jobOptions, [opt.name]: e.target.value })
                                                    }
                                                    required={opt.required}
                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-2 text-sm text-gray-900 dark:text-gray-100"
                                                >
                                                    <option value="">-- Choisir une valeur --</option>
                                                    {allowed.map((val) => (
                                                        <option key={val.trim()} value={val.trim()}>
                                                            {val.trim()}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type={currentInputType}
                                                    value={jobOptions[opt.name] || ''}
                                                    onChange={handleInputChange}
                                                    required={opt.required}
                                                    placeholder={opt.description || ''}
                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-2 text-sm text-gray-900 dark:text-gray-100"
                                                />
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Aucune option requise pour ce job.
                                </p>
                            )}

                            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                >
                                    Annuler
                                </Button>
                                <Button type="submit" variant="primary" disabled={isSubmitting}>
                                    {isSubmitting
                                        ? (selectedJob?.action === 'restart' ? 'Démarrage...' : 'Démarrage...')
                                        : (selectedJob?.action === 'restart' ? 'Démarrer' : 'Démarrer')
                                    }
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

            ) : null}
        </div>
    );
};