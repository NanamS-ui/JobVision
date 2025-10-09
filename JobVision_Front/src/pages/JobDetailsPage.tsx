import React, {useEffect, useRef, useState} from 'react';
import {
    Activity,
    Square,
    RotateCcw,
    Terminal,
    FileText,
    History,
    Clock,
    Loader2, Eye, Copy, Calendar,  BarChart2, Settings2, List,
    Bell
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { ProgressBar } from "../components/ui/ProgressBar.tsx";
import { useParams, Link } from "react-router-dom";
import { JobDetailDTO } from "../types/JobDetailDTO.ts";
import { JobDTO } from "../types/JobDTO.ts";
import {
    fetchHistory,
    fetchHistorySearch,
    fetchJobDetail,
    fetchJobByUuid,
    fetchNodesAPI,
    runJobWithOptions,
    stopJob
} from "../api/jobApi.ts";
import {Tabs,} from "../components/ui/Tabs.tsx";
import {CodeBlock} from "../components/ui/CodeBlock.tsx";
import {Modal} from "../components/ui/Modal.tsx";
import {CustomTooltip} from "../components/ui/CustomTooltip.tsx";
import TerminalLogViewer from "../components/ui/TerminalLogViewer.tsx";
import {OptionDTO} from "../types/OptionDTO.ts";
import HistoryTabs from "../components/job/tabs/HistoryTabs.tsx";
import {StatisticsTab} from "../components/job/tabs/StatisticsTab.tsx";
import {Notification} from "../components/job/tabs/Notification.tsx";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "../components/ui/Dialog.tsx";
import {fetchOptionsByJobId} from "../api/optionApi.ts";
import {usePopup} from "../components/pop-up/PopupProviderProps.tsx";

export const JobDetailsPage: React.FC = () => {
    useEffect(() => {
        document.title = "Job Details - JobVision";
    }, []);

    const { idJob } = useParams<{ idJob: string }>();
    const { showPopup } = usePopup();
    const [data, setData] = useState<JobDetailDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [referencedJobs, setReferencedJobs] = useState<Record<string, JobDTO>>({});
    const [selectedLogs, setSelectedLogs] = useState<string | null>(null);
    const [showScriptModal, setShowScriptModal] = useState(false);
    const [currentScript, setCurrentScript] = useState('');
    const timeoutRef = useRef<number | null>(null);
    const [currentPageMap, setCurrentPageMap] = React.useState<{ [stepNumber: number]: number }>({});

    // États pour le modal des options
    const [isStartModalOpen, setIsStartModalOpen] = useState(false);
    const [availableOptions, setAvailableOptions] = useState<OptionDTO[]>([]);
    const [jobOptions, setJobOptions] = useState<{ [key: string]: any }>({});
    const [inputTypes, setInputTypes] = useState<{ [key: string]: 'text' | 'date' }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SUCCEEDED':
                return <Badge variant="success">Terminé</Badge>;
            case 'NODE_PARTIAL_SUCCEEDED':
                return <Badge variant="success">Succès partiel des nœuds</Badge>;
            case 'FAILED':
                return <Badge variant="error">Échec</Badge>;
            case 'RUNNING':
                return <Badge variant="info">En cours</Badge>;
            case 'WAITING':
                return <Badge variant="warning">En attente</Badge>;
            case 'NOT_STARTED':
                return <Badge variant="warning">Non démarré</Badge>;
            default:
                return <Badge variant="default">En attente</Badge>;
        }
    };

    const handleViewLogs = (nodeId: string) => {
        setSelectedLogs(selectedLogs === nodeId ? null : nodeId);
    };
    const progressCheckDetail = Number(import.meta.env.VITE_PROGRESS_CHECK_DETAIL) || 10000
    const previousStateRef = useRef<string | null>(null);

    const loadReferencedJobs = async (steps: any[]) => {
        const jobRefs = steps
            .filter(step => step.jobRef || step.pluginType === "job-ref")
            .map(step => step.jobRef)
            .filter(Boolean);

        if (jobRefs.length === 0) return;

        try {
            const jobPromises = jobRefs.map(async (uuid: string) => {
                if (!referencedJobs[uuid]) {
                    try {
                        const response = await fetchJobByUuid(uuid);
                        const job = response.data || response;
                        return { uuid, job };
                    } catch (error) {
                        console.error("Erreur lors de la récupération du job pour UUID:", uuid, error);
                        return null;
                    }
                }
                return null;
            });

            const results = await Promise.all(jobPromises);
            const newJobs = results
                .filter(Boolean)
                .reduce((acc, result) => {
                    if (result) {
                        acc[result.uuid] = result.job;
                    }
                    return acc;
                }, {} as Record<string, JobDTO>);

            if (Object.keys(newJobs).length > 0) {
                console.log("Jobs référencés chargés:", newJobs);
                setReferencedJobs(prev => ({ ...prev, ...newJobs }));
            }
        } catch (err) {
            console.error("Failed to load referenced jobs:", err);
        }
    };

    const loadData = async () => {
        try {
            const jobId = Number(idJob);
            if (!jobId || isNaN(jobId)) return;

            const [detail] = await Promise.all([
                fetchJobDetail(jobId),
            ]);

            console.log(detail);
            // Set only if changed (optional optimization)
            setData(prev => JSON.stringify(prev) !== JSON.stringify(detail) ? detail : prev);

            // Load referenced jobs
            await loadReferencedJobs(detail.job.myWorkflow.steps);

            const currentState = detail.executionState.executionState;
            const previousState = previousStateRef.current;

            previousStateRef.current = currentState;

            if (previousState !== "SUCCEEDED" && currentState === "SUCCEEDED") {
                timeoutRef.current = window.setTimeout(loadData, 1000);
            } else if (currentState === "WAITING") {
                timeoutRef.current = window.setTimeout(loadData, 5000); // refresh every 5 seconds when WAITING
            } else if (["RUNNING", "FAILED"].includes(currentState)) {
                timeoutRef.current = window.setTimeout(loadData, progressCheckDetail); // default delay
            } else {
                console.log("Execution ended with status:", currentState);
            }

        } catch (err) {
            console.error(err);
            setError("Failed to load job details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        if (isMounted) loadData();

        return () => {
            isMounted = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [idJob]);

    // Charger les options du job quand le modal s'ouvre
    useEffect(() => {
        if (isStartModalOpen && idJob) {
            fetchOptionsByJobId(Number(idJob))
                .then((options) => {
                    setAvailableOptions(options);
                })
                .catch((error) => {
                    console.error("Erreur lors du chargement des options:", error);
                    setAvailableOptions([]);
                });
        }
    }, [isStartModalOpen, idJob]);

    const waitForExecutionStart = async (jobId: number, retries = 5) => {
        for (let i = 0; i < retries; i++) {
            const detail = await fetchJobDetail(jobId);
            if (detail?.executionState?.executionId) return detail;
            await new Promise(resolve => setTimeout(resolve, 900));
        }
        throw new Error("Execution did not start in time");
    };

    const handleRestart = () => {
        setIsStartModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsStartModalOpen(false);
        setJobOptions({});
    };

    const handleStartJob = async () => {
        const jobId = Number(idJob);
        if (!jobId || isNaN(jobId)) return;

        try {
            setIsSubmitting(true);
            await runJobWithOptions(jobId, jobOptions);
            showPopup({
                title: 'Job démarré',
                message: `Le job "${data?.job.name}" a été démarré avec succès`,
                type: 'success',
                duration: 3000,
            });
            handleCloseModal();
            const detail = await waitForExecutionStart(jobId);
            setData(detail);
            loadData();
        } catch (error: any) {
            showPopup({
                title: 'Erreur',
                message: `Erreur lors du démarrage du job: ${error.message}`,
                type: 'error',
                duration: 3000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStop = async () => {
        const jobId = Number(idJob);
        if (!jobId || isNaN(jobId)) return;

        try {
            setLoading(true);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            await stopJob(jobId);
            const detail = await waitForExecutionStart(jobId);
            setData(detail);
            setLoading(false);
            loadData();
        } catch (error) {
            console.error("Erreur lors du redémarrage du job :", error);
        }
    };

    const parseCronExpression = (cronExpr: string): string => {
        const parts = cronExpr.trim().split(/\s+/);
        if (parts.length < 6 || parts.length > 7) return "Expression cron invalide";

        const [second, minute, hour, dayOfMonth, month, dayOfWeek, year = '*'] = parts;

        const pad = (s: string) => s.padStart(2, '0');

        const dayMap: Record<string, string> = {
            MON: "lundi",
            TUE: "mardi",
            WED: "mercredi",
            THU: "jeudi",
            FRI: "vendredi",
            SAT: "samedi",
            SUN: "dimanche"
        };

        const parseDaysOfWeek = (dow: string) => {
            if (dow.includes(',')) return dow.split(',').map(d => dayMap[d] || d).join(', ');
            if (dow.includes('-')) {
                const [start, end] = dow.split('-');
                return `${dayMap[start] || start} à ${dayMap[end] || end}`;
            }
            return dayMap[dow] || dow;
        };

        // Cas : chaque minute
        if (second === '0' && minute === '*' && hour === '*' && (dayOfMonth === '*' || dayOfMonth === '?') && month === '*' && (dayOfWeek === '*' || dayOfWeek === '?') && year === '*') {
            return "Chaque minute";
        }

        // Cas : intervalle de minutes
        if (second === '0' && minute.includes('/') && hour === '*' && (dayOfMonth === '*' || dayOfMonth === '?') && month === '*' && (dayOfWeek === '*' || dayOfWeek === '?') && year === '*') {
            const interval = minute.split('/')[1];
            return `Toutes les ${interval} minute(s)`;
        }

        // Cas : intervalle d'heures
        if (second === '0' && minute === '0' && hour.includes('/') && (dayOfMonth === '*' || dayOfMonth === '?') && month === '*' && (dayOfWeek === '*' || dayOfWeek === '?') && year === '*') {
            const interval = hour.split('/')[1];
            return `Toutes les ${interval} heure(s)`;
        }

        // Cas : chaque jour à une heure précise
        if (second === '0' && minute !== '*' && hour !== '*' && (dayOfMonth === '*' || dayOfMonth === '?') && month === '*' && (dayOfWeek === '*' || dayOfWeek === '?') && year === '*') {
            return `Chaque jour à ${pad(hour)}:${pad(minute)}`;
        }

        // Cas : jour spécifique de la semaine
        if (second === '0' && minute !== '*' && hour !== '*' && (dayOfMonth === '*' || dayOfMonth === '?') && month === '*' && dayOfWeek !== '*' && year === '*') {
            return `Chaque ${parseDaysOfWeek(dayOfWeek)} à ${pad(hour)}:${pad(minute)}`;
        }

        // Cas : jour spécifique du mois
        if (second === '0' && minute !== '*' && hour !== '*' && dayOfMonth !== '?' && month === '*' && (dayOfWeek === '?' || dayOfWeek === '*') && year === '*') {
            return `Chaque mois le ${dayOfMonth} à ${pad(hour)}:${pad(minute)}`;
        }

        // Cas : jour et mois spécifique
        if (second === '0' && minute !== '*' && hour !== '*' && dayOfMonth !== '?' && month !== '*' && (dayOfWeek === '?' || dayOfWeek === '*') && year === '*') {
            return `Chaque année le ${dayOfMonth}/${month} à ${pad(hour)}:${pad(minute)}`;
        }

        // Cas : premier jour du mois à minuit
        if (second === '0' && minute === '0' && hour === '0' && dayOfMonth === '1' && month === '*' && dayOfWeek === '?' && year === '*') {
            return "Premier jour de chaque mois à minuit";
        }

        return "Expression cron personnalisée";
    };

    const getNextExecution = (cronExpr: string): string => {
        if (!cronExpr || cronExpr.trim() === '') return "Aucune planification";

        const parts = cronExpr.trim().split(/\s+/);
        if (parts.length < 6 || parts.length > 7) return "Expression cron invalide";

        const [second, minute, hour, dayOfMonth, month, dayOfWeek, year = '*'] = parts;
        const now = new Date();
        const next = new Date(now);

        try {
            // Définir les secondes
            if (second !== '*') {
                next.setSeconds(Number(second));
            } else {
                next.setSeconds(0);
            }

            // Définir la minute
            if (minute !== '*') {
                if (minute.includes('/')) {
                    const interval = Number(minute.split('/')[1]);
                    const currentMinute = now.getMinutes();
                    const nextMinute = Math.ceil((currentMinute + 1) / interval) * interval;
                    next.setMinutes(nextMinute % 60);
                    if (nextMinute >= 60) {
                        next.setHours(next.getHours() + 1);
                    }
                } else {
                    next.setMinutes(Number(minute));
                }
            } else {
                next.setMinutes(now.getMinutes() + 1);
            }

            // Définir l'heure
            if (hour !== '*') {
                if (hour.includes('/')) {
                    const interval = Number(hour.split('/')[1]);
                    const currentHour = now.getHours();
                    const nextHour = Math.ceil((currentHour + 1) / interval) * interval;
                    next.setHours(nextHour % 24);
                    if (nextHour >= 24) {
                        next.setDate(next.getDate() + 1);
                    }
                } else {
                    next.setHours(Number(hour));
                }
            }

            // Définir le jour du mois
            if (dayOfMonth !== '*' && dayOfMonth !== '?') {
                if (dayOfMonth.includes('/')) {
                    const interval = Number(dayOfMonth.split('/')[1]);
                    const currentDay = now.getDate();
                    const nextDay = Math.ceil((currentDay + 1) / interval) * interval;
                    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                    if (nextDay <= daysInMonth) {
                        next.setDate(nextDay);
                    } else {
                        next.setMonth(next.getMonth() + 1);
                        next.setDate(interval);
                    }
                } else {
                    next.setDate(Number(dayOfMonth));
                }
            }

            // Définir le mois
            // Définir le mois
            if (month !== '*') {
                if (month.includes('/')) {
                    const interval = Number(month.split('/')[1]);
                    const currentMonth = now.getMonth() + 1;
                    const nextMonth = Math.ceil((currentMonth + 1) / interval) * interval;
                    next.setMonth((nextMonth - 1) % 12);
                    if (nextMonth > 12) {
                        next.setFullYear(next.getFullYear() + 1);
                    }
                } else {
                    next.setMonth(Number(month) - 1);
                }
            }
// si * => ne rien faire (tous les mois)


            // Définir le jour de la semaine
            if (dayOfWeek !== '*' && dayOfWeek !== '?') {
                const currentDay = now.getDay(); // 0 = dimanche
                let targetDay: number;

                const dayMap: Record<string, number> = {
                    'SUN': 0, 'MON': 1, 'TUE': 2, 'WED': 3,
                    'THU': 4, 'FRI': 5, 'SAT': 6
                };

                if (dayOfWeek.includes(',')) {
                    const days = dayOfWeek.split(',').map(d => dayMap[d] ?? Number(d));
                    targetDay = days.find(d => d > currentDay) ?? days[0];
                } else if (dayOfWeek.includes('-')) {
                    // Exemple: MON-FRI
                    const [start, end] = dayOfWeek.split('-');
                    const startDay = dayMap[start] ?? Number(start);
                    const endDay = dayMap[end] ?? Number(end);

                    if (currentDay < startDay) {
                        targetDay = startDay;
                    } else if (currentDay >= startDay && currentDay <= endDay) {
                        // On est déjà dans la plage -> prendre le même jour si l'heure est dans le futur,
                        // sinon le prochain jour
                        targetDay = currentDay === endDay ? startDay : currentDay + 1;
                    } else {
                        // En dehors de la plage -> prochaine occurrence au prochain startDay
                        targetDay = startDay;
                        next.setDate(next.getDate() + ((7 - currentDay + startDay) % 7));
                    }
                } else {
                    targetDay = dayMap[dayOfWeek] ?? Number(dayOfWeek);
                }

                const delta = (targetDay + 7 - currentDay) % 7;
                next.setDate(now.getDate() + delta);
            }

            // Définir l'année
            if (year !== '*') {
                next.setFullYear(Number(year));
            }

            // S'assurer que la date est dans le futur
            if (next <= now) {
                next.setMinutes(next.getMinutes() + 1);
            }

            return next.toLocaleString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

        } catch (error) {
            console.error('Erreur lors du calcul de la prochaine exécution:', error);
            return "Erreur de calcul";
        }
    };

    const [activeTab, setActiveTab] = useState("workflow");

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-green-600 dark:text-green-400" />
            <span className="text-green-600 dark:text-green-400 animate-pulse">
    Chargement des données...
  </span>
        </div>

    );

    if (error) return <div className="text-red-500 p-4">{error}</div>;
    if (!data) return <div className="p-4">Aucune donnée disponible</div>;

    const totalSteps = data.job.myWorkflow.steps.length;
    const completedSteps = data.job.myWorkflow.steps.filter(
        step => step.executionState === "SUCCEEDED"
    ).length;

    return (
        <div className="space-y-6 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {data.job.name}
                    </h1>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        UUID : {data.job.uuid}
                    </p>

                    {data.job.description && (
                        <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Description :
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                {data.job.description}
                            </p>
                        </div>
                    )}
                </div>


                <div className="flex items-center space-x-4">
                    {data.executionState.executionState === 'RUNNING' && (
                        <>
                            <Button variant="outline" size="sm" onClick={handleStop}>
                                <Square className="h-4 w-4 mr-2" />
                                Arrêt
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleRestart}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Restart
                            </Button>
                        </>
                    )}

                    {data.executionState.executionState === 'SUCCEEDED' && (
                        <Button variant="outline" size="sm" onClick={handleRestart}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Redémarrage
                        </Button>
                    )}

                    {data.executionState.executionState === 'FAILED' && (
                        <Button variant="outline" size="sm" onClick={handleRestart}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Redémarrage
                        </Button>
                    )}

                    {getStatusBadge(data.executionState.executionState)}
                </div>
            </div>


            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <Tabs.List className="border-b border-gray-200 dark:border-gray-700 flex space-x-8">
                    <Tabs.Trigger
                        value="workflow"
                        className="flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                           border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300
                           dark:text-gray-400 dark:hover:text-gray-300
                           data-[state=active]:border-primary-500
                           data-[state=active]:text-primary-600
                           dark:data-[state=active]:text-primary-400">
                        <Activity className="h-5 w-5 mr-2" />
                        Détails
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="history"
                        className="flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
               border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300
               dark:text-gray-400 dark:hover:text-gray-300
               data-[state=active]:border-primary-500
               data-[state=active]:text-primary-600
               dark:data-[state=active]:text-primary-400">
                        <History className="h-5 w-5 mr-2" />
                        Historique
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="statistics"
                        className="flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                           border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300
                           dark:text-gray-400 dark:hover:text-gray-300
                           data-[state=active]:border-primary-500
                           data-[state=active]:text-primary-600
                           dark:data-[state=active]:text-primary-400">
                        <BarChart2 className="h-5 w-5 mr-2" />
                        Statistiques
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="notification"
                        className="flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                           border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300
                           dark:text-gray-400 dark:hover:text-gray-300
                           data-[state=active]:border-primary-500
                           data-[state=active]:text-primary-600
                           dark:data-[state=active]:text-primary-400">
                        <Bell className="h-5 w-5 mr-2" />
                        Notification
                    </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="workflow" className="pt-4">
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Progression globale du job
                                </h3>
                                <span className="text-2xl text-black dark:text-white">
                                  {data.executionState.executionState === 'SUCCEEDED' ? '100.0' : data.executionState.progress?.toFixed(1)}%
                                </span>
                            </div>
                            <ProgressBar
                                value={data.executionState.executionState === 'SUCCEEDED' ? 100 : data.executionState.progress}
                                variant="default"
                                size="lg"
                                className="mb-2"
                            />
                            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                <span>Étape {completedSteps} sur {totalSteps}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Beautiful Cron Expression Display */}
                    {data.job.cronExpression && (
                        <Card className="mb-8 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-100 dark:border-blue-800">
                                <CardContent className="p-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                                                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                                        Planification automatique
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                        Ce job s'exécute automatiquement selon le planning défini
                                                    </p>
                                                </div>
                                                <Badge variant="info" size="sm">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    Active
                                                </Badge>
                                            </div>

                                            <div className="mt-4 space-y-4">
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Expression Cron
                                                    </h4>
                                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                                        <code className="text-sm font-mono text-blue-600 dark:text-blue-400 font-semibold break-all">
                                                            {data.job.cronExpression}
                                                        </code>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        <strong className="font-semibold">
                                                            {parseCronExpression(data.job.cronExpression)}
                                                        </strong>
                                                    </p>
                                                </div>

                                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                    <div className="flex items-center space-x-2">
                                                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                                                Prochaine exécution :
                                                            </span>
                                                    </div>
                                                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 font-mono">
                                                        {getNextExecution(data.job.cronExpression)}
                                                    </p>
                                                </div>

                                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
                                                    <h5 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">
                                                        Format Cron Quartz (7 champs):
                                                    </h5>
                                                    <div className="space-y-2">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono font-semibold text-blue-600 dark:text-blue-400">
                                                                Secondes Minutes Heures Jour Mois Jour de la semaine Année
                                                            </code>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="text-gray-700 dark:text-gray-300">Exemple:</span>
                                                            <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono font-semibold text-blue-600 dark:text-blue-400">
                                                                0 0 8 ? * MON-FRI *
                                                            </code>
                                                            <span className="text-gray-700 dark:text-gray-300">= Chaque jour ouvrable à 8h</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 text-xs leading-snug text-gray-500 dark:text-gray-400">
                                                        <p>• <strong>Année</strong> : champ facultatif.</p>
                                                        <p>• <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">?</code> : aucune valeur spécifique.</p>
                                                        <p>• Voir documentation Quartz pour syntaxe avancée.</p>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </CardContent>
                            </div>
                        </Card>
                    )}

                    {/* Workflow Options Display */}
                    {data.job.myWorkflow.options.length > 0 && (
                        <Card className="mb-8 overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-b border-emerald-100 dark:border-emerald-800">
                                <CardContent className="p-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center">
                                                <Settings2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                                        Options du Workflow
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                        Ces options sont disponibles lors de l’exécution de ce workflow
                                                    </p>
                                                </div>
                                                <Badge variant="success" size="sm">
                                                    <List className="h-3 w-3 mr-1" />
                                                    {data.job.myWorkflow.options.length} options
                                                </Badge>
                                            </div>

                                            <div className="space-y-4 mt-4">
                                                {data.job.myWorkflow.options.map((option: OptionDTO) => (
                                                    <div key={option.name} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="font-medium text-gray-900 dark:text-gray-100">{option.name}</span>
                                                                {option.required && (
                                                                    <span className="text-xs bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-2 py-0.5 rounded-full">
                                                  Obligatoire
                                                </span>
                                                                )}
                                                                {option.secure && (
                                                                    <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                                                  Sécurisé
                                                </span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {option.id ? `ID : ${option.id}` : 'Nouvelle option'}
                                                            </div>
                                                        </div>

                                                        {option.description && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{option.description}</p>
                                                        )}

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <p className="text-gray-500 dark:text-gray-400">Valeur par défaut :</p>
                                                                <p className="text-gray-900 dark:text-gray-100 font-mono break-all">
                                                                    {option.defaultValue || <span className="text-gray-400">Non spécifiée</span>}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p className="text-gray-500 dark:text-gray-400">Valeurs autorisées :</p>
                                                                <p className="text-gray-900 dark:text-gray-100 font-mono break-all">
                                                                    {option.allowedValues || <span className="text-gray-400">Toutes les valeurs</span>}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p className="text-gray-500 dark:text-gray-400">Validation :</p>
                                                                <p className="text-gray-900 dark:text-gray-100 font-mono break-all">
                                                                    {option.regex || <span className="text-gray-400">Aucune regex</span>}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p className="text-gray-500 dark:text-gray-400">Propriétés :</p>
                                                                <div className="flex flex-wrap gap-2 mt-1">
                                                                    {option.multivalued && (
                                                                        <span className="text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded-full">
                                                                            Multivaluée
                                                                        </span>
                                                                    )}
                                                                    {option.valueExposed && (
                                                                        <span className="text-xs bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full">
                                                                            Valeur exposée
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </div>
                        </Card>
                    )}

                    <div className="space-y-6">
                        {data.job.myWorkflow.steps.map((step) => {
                            const nodes = Object.entries(step.nodeStates ?? {});
                            const nodesPerPage = 3;

                            const currentPage = currentPageMap[step.stepNumber] || 1;
                            const totalPages = Math.ceil(nodes.length / nodesPerPage);
                            const paginatedNodes = nodes.slice((currentPage - 1) * nodesPerPage, currentPage * nodesPerPage);

                            const handlePageChange = (stepNumber: number, direction: 'next' | 'prev') => {
                                setCurrentPageMap((prev) => {
                                    const current = prev[stepNumber] || 1;
                                    const nextPage = direction === 'next' ? current + 1 : current - 1;
                                    return {
                                        ...prev,
                                        [stepNumber]: Math.max(1, Math.min(totalPages, nextPage)),
                                    };
                                });
                            };
                            return (
                                <Card key={step.stepNumber} className="overflow-hidden">
                                    <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold relative ${
                                                    step.executionState === "SUCCEEDED"
                                                        ? "bg-green-500 dark:bg-green-600"
                                                        : step.executionState === "RUNNING"
                                                            ? "bg-blue-500 dark:bg-blue-600"
                                                            : step.executionState === "FAILED"
                                                                ? "bg-red-500 dark:bg-red-600"
                                                                : step.executionState === "WAITING"
                                                                    ? "bg-yellow-500 dark:bg-yellow-600"
                                                                    : "bg-gray-400 dark:bg-gray-500"
                                                }`}>
                                                    {step.stepNumber}
                                                    {step.executionState === "RUNNING" && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        </div>
                                                    )}
                                                    {step.executionState === "WAITING" && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="w-6 h-6 bg-white bg-opacity-30 rounded-full animate-ping"></div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                                        {step.name}
                                                    </h2>
                                                    {step.description && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            {step.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {nodes.filter(([, nodeState]) => nodeState.executionState === "SUCCEEDED").length}/{nodes.length} nœuds réussis
                                                </p>
                                                {getStatusBadge(step.executionState ?? "")}
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="border-t border-gray-200 dark:border-gray-700">
                                        {/* Affichage spécial pour les étapes avec jobRef ou pluginType="job-ref" */}
                                        {(step.jobRef || step.pluginType === "job-ref") ? (
                                            <div className="mb-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                                        <Activity className="h-5 w-5 mr-2" />
                                                        Référence de Job
                                                    </h4>
                                                    <div className="flex space-x-2">
                                                        {referencedJobs[step.jobRef] && (
                                                            <>
                                                                <Link to={`/jobs/${referencedJobs[step.jobRef].id}`}>
                                                                    <Button variant="primary" size="sm">
                                                                        <Eye className="h-4 w-4 mr-1" />
                                                                        Voir Détails
                                                                    </Button>
                                                                </Link>
                                                            </>
                                                        )}
                                                        <CustomTooltip content={<span>Copier l'UUID du job référencé</span>}>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(step.jobRef || '');
                                                                }}
                                                            >
                                                                <Copy className="h-4 w-4 mr-1" />
                                                                Copier UUID
                                                            </Button>
                                                        </CustomTooltip>
                                                    </div>
                                                </div>

                                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                                                    <div className="flex items-start space-x-4">
                                                        <div className="flex-shrink-0">
                                                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                                                                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            {referencedJobs[step.jobRef] ? (
                                                                <div className="space-y-4">
                                                                    <div>
                                                                        <Link
                                                                            to={`/jobs/${referencedJobs[step.jobRef].id}`}
                                                                            className="group"
                                                                        >
                                                                            <h5 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-1 hover:text-blue-700 dark:hover:text-blue-200 transition-colors cursor-pointer inline-flex items-center">
                                                                                {referencedJobs[step.jobRef].name}
                                                                                <Eye className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                            </h5>
                                                                        </Link>
                                                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                                                            {referencedJobs[step.jobRef].description || 'Aucune description disponible'}
                                                                        </p>
                                                                    </div>

                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <Link
                                                                            to={`/jobs/${referencedJobs[step.jobRef].id}`}
                                                                            className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer group"
                                                                        >
                                                                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">ID du Job</p>
                                                                            <div className="flex items-center justify-between">
                                                                                <p className="text-sm font-mono text-blue-900 dark:text-blue-100">
                                                                                    {referencedJobs[step.jobRef].id}
                                                                                </p>
                                                                                <Eye className="h-4 w-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                            </div>
                                                                        </Link>

                                                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                                                                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">UUID</p>
                                                                            <p className="text-sm font-mono text-blue-900 dark:text-blue-100 break-all">
                                                                                {step.jobRef}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center justify-between pt-2">
                                                                        <div className="text-xs text-blue-600 dark:text-blue-400">
                                                                            Job référencé depuis ce workflow
                                                                        </div>
                                                                        <Link
                                                                            to={`/jobs/${referencedJobs[step.jobRef].id}`}
                                                                            className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                                                                        >
                                                                            <Eye className="h-4 w-4 mr-1" />
                                                                            Accéder aux détails
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-3">
                                                                    <div>
                                                                        <h5 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                                                            Job référencé par UUID
                                                                        </h5>
                                                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                                                            Chargement des détails du job référencé...
                                                                        </p>
                                                                    </div>

                                                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                                                                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">UUID du Job</p>
                                                                        <code className="text-sm font-mono text-blue-900 dark:text-blue-100 break-all">
                                                                            {step.jobRef}
                                                                        </code>
                                                                    </div>

                                                                    <div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400">
                                                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                                                        <span>Récupération des informations...</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (step.command || step.script) && (
                                            <div className="mb-6">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                                        <Terminal className="h-4 w-4 mr-2" />
                                                        Script / Commande d'exécution
                                                    </h4>
                                                    <div className="flex space-x-2">
                                                        {step.script && (
                                                            <CustomTooltip content={<span>Voir le script complet</span>}>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setCurrentScript(step.script || '');
                                                                        setShowScriptModal(true);
                                                                    }}
                                                                >
                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                    Voir Script
                                                                </Button>
                                                            </CustomTooltip>
                                                        )}
                                                        {step.command && (
                                                            <CustomTooltip content={<span>Copier la commande</span>}>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(step.command || '');
                                                                    }}
                                                                >
                                                                    <Copy className="h-4 w-4 mr-1" />
                                                                    Copier
                                                                </Button>
                                                            </CustomTooltip>
                                                        )}
                                                    </div>
                                                </div>

                                                <CodeBlock
                                                    code={step.script || step.command || ''}
                                                    language={step.pluginType}
                                                    className="max-h-60 overflow-y-auto"
                                                />
                                            </div>
                                        )}

                                        {/* Afficher les nœuds d'exécution seulement si ce n'est pas une référence de job */}
                                        {!(step.jobRef || step.pluginType === "job-ref") && (
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                                    <Activity className="h-4 w-4 mr-2" />
                                                    Nœuds d'exécution ({nodes.length})
                                                </h4>

                                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                    {paginatedNodes.map(([nodeName, nodeState]) => (
                                                        <Card
                                                            key={nodeName}
                                                            className={`border-l-4 ${
                                                                nodeState.executionState === "SUCCEEDED"
                                                                    ? "border-l-green-500 bg-green-50 dark:bg-green-900/10"
                                                                    : nodeState.executionState === "FAILED"
                                                                        ? "border-l-red-500 bg-red-50 dark:bg-red-900/10"
                                                                        : nodeState.executionState === "RUNNING"
                                                                            ? "border-l-blue-500 bg-blue-50 dark:bg-blue-900/10"
                                                                            : "border-l-gray-400 bg-gray-50 dark:bg-gray-700/10"
                                                            }`}
                                                        >
                                                            <CardContent className="p-4">
                                                                <div className="flex justify-between mb-3">
                                                                    <div>
                                                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{nodeName}</h3>
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                            Statut : {nodeState.executionState}
                                                                        </p>
                                                                    </div>
                                                                    {getStatusBadge(nodeState.executionState)}
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                                                    {nodeState.startTime && (
                                                                        <div>
                                                                            <span className="text-gray-500 dark:text-gray-400">Début :</span>
                                                                            <p className="text-gray-900 dark:text-gray-100">{nodeState.startTime}</p>
                                                                        </div>
                                                                    )}
                                                                    {nodeState.duration && (
                                                                        <div>
                                                                            <span className="text-gray-500 dark:text-gray-400">Durée (ms) :</span>
                                                                            <p className="text-gray-900 dark:text-gray-100">{nodeState.duration}</p>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="text-right text-sm font-mono text-gray-700 dark:text-gray-300 mb-1 select-none">
                                                                    {(nodeState.progressStatePerNode ?? 0).toFixed(0)}%
                                                                </div>

                                                                {/* La barre de progression */}
                                                                <ProgressBar
                                                                    className="w-full rounded-md mb-4"
                                                                    value={nodeState.progressStatePerNode ?? 0}
                                                                    max={100}
                                                                    variant={
                                                                        nodeState.executionState === 'SUCCEEDED'
                                                                            ? 'success'
                                                                            : nodeState.executionState === 'FAILED'
                                                                                ? 'error'
                                                                                : nodeState.executionState === 'RUNNING'
                                                                                    ? 'warning'
                                                                                    : 'default'
                                                                    }
                                                                    size="md"
                                                                />

                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleViewLogs(nodeName)}
                                                                    className="w-full"
                                                                >
                                                                    <FileText className="h-4 w-4 mr-2" />
                                                                    {selectedLogs === nodeName ? "Masquer les logs" : "Afficher les logs"}
                                                                </Button>

                                                                {selectedLogs === nodeName && (
                                                                    <TerminalLogViewer
                                                                        logs={nodeState.logs}
                                                                        executionState={nodeState.executionState}
                                                                    />
                                                                )}

                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>

                                                {totalPages > 1 && (
                                                    <div className="flex justify-between items-center mt-4">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={currentPage === 1}
                                                            onClick={() => handlePageChange(step.stepNumber, 'prev')}
                                                        >
                                                            ← Précédent
                                                        </Button>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                        Page {currentPage} sur {totalPages}
                    </span>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={currentPage === totalPages}
                                                            onClick={() => handlePageChange(step.stepNumber, 'next')}
                                                        >
                                                            Suivant →
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </Tabs.Content>

                <Tabs.Content value="history" className="pt-4">
                    {activeTab === 'history' && (
                        <HistoryTabs
                            idJob={idJob}
                            isActive={true}
                            fetchHistory={fetchHistory}
                            fetchNodesAPI={fetchNodesAPI}
                            fetchHistorySearch={fetchHistorySearch}
                        />
                    )}
                </Tabs.Content>

                <Tabs.Content value="statistics">
                    {activeTab === 'statistics' && (
                        <StatisticsTab
                            jobId={Number(idJob)}
                            isActive={true}
                        />
                    )}
                </Tabs.Content>

                <Tabs.Content value="notification">
                    {activeTab === 'notification' && (
                        <Notification
                            jobId={Number(idJob)}
                            isActive={true}
                        />
                    )}
                </Tabs.Content>

            </Tabs>

            <Modal
                open={showScriptModal}
                onClose={() => setShowScriptModal(false)}
                title="Script Complet"
                size="xl"
            >
                <div className="max-h-[70vh] overflow-auto">
                    <CodeBlock
                        code={currentScript}
                        language={currentScript.split('.').pop()}
                        showLineNumbers
                    />
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => {
                            navigator.clipboard.writeText(currentScript);
                        }}
                    >
                        <Copy className="h-4 w-4 mr-2" />
                        Copier le Script
                    </Button>
                    <Button onClick={() => setShowScriptModal(false)}>
                        Fermer
                    </Button>
                </div>
            </Modal>

            {/* Modal des options pour le redémarrage */}
            {isStartModalOpen && (
                <Dialog open={isStartModalOpen} onOpenChange={handleCloseModal}>
                    <DialogHeader>
                        <DialogTitle>
                            Redémarrer le job : {data?.job.name}
                        </DialogTitle>
                    </DialogHeader>

                    <DialogContent>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                await handleStartJob();
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
                                    onClick={handleCloseModal}
                                    disabled={isSubmitting}
                                >
                                    Annuler
                                </Button>
                                <Button type="submit" variant="primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Démarrage...' : 'Redémarrer'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};