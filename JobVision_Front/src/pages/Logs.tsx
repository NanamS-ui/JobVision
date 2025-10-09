import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
    FileText,
    Search,
    AlertCircle,
    Info,
    AlertTriangle,
    Bug,
    Filter,
    Briefcase,
    Calendar,
    Server,
    Download,
} from 'lucide-react';
import { LogCountsResponse } from "../types/LogCountsResponse.ts";
import {exportLogsXls, fetchLogCounts, fetchRecentLogs, searchLogs} from "../api/logApi.ts";
import { LogOutputViewDTO } from "../types/LogOutputViewDTO.ts";
import { fetchJobs } from "../api/jobApi.ts";
import { fetchNodes } from "../api/nodeApi.ts";
import { LogFilterDTO } from "../types/LogFilterDTO.ts";
import { Button } from "../components/ui/Button.tsx";

export interface NodeNameDTO {
    nodename: string;
    hostname: string;
}

export interface JobNameDTO {
    jobName: string;
    jobId: string;
}

export const Logs: React.FC = () => {
    useEffect(() => {
        document.title = "Logs - JobVision";
    }, []);

    const [selectedLevel, setSelectedLevel] = useState<string>('all');
    const [selectedJob, setSelectedJob] = useState<string>('all');
    const [selectedNode, setSelectedNode] = useState<string>('all');
    const [logs, setLogs] = useState<LogOutputViewDTO[]>([]);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [jobs, setJobs] = useState<JobNameDTO[]>([]);
    const [nodes, setNodes] = useState<NodeNameDTO[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Nouvel état pour les compteurs de logs
    const [logCounts2, setLogCounts] = useState<LogCountsResponse>({
        totalLogs: 0,
        normalCount: 0,
        errorCount: 0,
        warnCount: 0,
    });

    useEffect(() => {
        fetchLogCounts()
            .then(data => setLogCounts(data))
            .catch(err => {
                console.error('Échec de récupération des compteurs de logs', err);
            });
    }, []);

    useEffect(() => {
        fetchRecentLogs()
            .then(data => setLogs(data))
            .catch(err => console.error('Échec de récupération des logs récents', err));
    }, []);

    useEffect(() => {
        fetchJobs()
            .then(setJobs)
            .catch(() => setError('Échec du chargement des jobs'));

        fetchNodes()
            .then(setNodes)
            .catch(() => setError('Échec du chargement des nœuds'));
    }, []);

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'ERROR': return <AlertCircle className="h-4 w-4" />;
            case 'WARN': return <AlertTriangle className="h-4 w-4" />;
            case 'NORMAL': return <Info className="h-4 w-4" />;
            case 'debug': return <Bug className="h-4 w-4" />;
            default: return <Info className="h-4 w-4" />;
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'ERROR': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
            case 'WARN': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
            case 'NORMAL': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
            case 'debug': return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
            default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
        }
    };

    const getLevelBadge = (level: string) => {
        switch (level) {
            case 'ERROR': return 'error';
            case 'WARN': return 'warning';
            case 'NORMAL': return 'info';
            case 'debug': return 'default';
            default: return 'default';
        }
    };

    const handleApplyFilters = async () => {
        const filter: LogFilterDTO = {
            logLevel: selectedLevel === 'all' ? null : selectedLevel,
            user: null,
            jobName: selectedJob === 'all' ? null : selectedJob,
            hostname: selectedNode === 'all' ? null : selectedNode,
            startDate: startDate ? new Date(startDate).toISOString() : null,
            endDate: endDate ? new Date(endDate).toISOString() : null,
        };

        try {
            const filteredLogs = await searchLogs(filter);
            setLogs(filteredLogs);
        } catch (error) {
            console.error('Échec de récupération des logs filtrés', error);
        }
    };

    const handleExport = async () => {
        const filter: LogFilterDTO = {
            logLevel: selectedLevel === 'all' ? null : selectedLevel,
            user: null,
            jobName: selectedJob === 'all' ? null : selectedJob,
            hostname: selectedNode === 'all' ? null : selectedNode,
            startDate: startDate ? new Date(startDate).toISOString() : null,
            endDate: endDate ? new Date(endDate).toISOString() : null,
        };

        const parts = ['logs'];

        if (filter.logLevel) parts.push(filter.logLevel.toLowerCase());
        if (filter.startDate) parts.push(`de-${filter.startDate.substring(0, 10)}`);
        if (filter.endDate) parts.push(`à-${filter.endDate.substring(0, 10)}`);

        const fileName = parts.join('_') + '.xls';

        try {
            const xlsBlob = await exportLogsXls(filter);
            const url = window.URL.createObjectURL(xlsBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError('Échec de l\'exportation du fichier XLS des logs');
            console.error(err);
        }
    };

    const logsPerPage = 20;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(logs.length / logsPerPage);
    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
    const numberFormatter = new Intl.NumberFormat("de-DE");
    if (error) return <div>{error}</div>;
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Logs d’exécution
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Surveillez et analysez les logs d’exécution des jobs sur tous les services
                    </p>
                </div>
            </div>

            {/* Contrôles de pagination - Haut (aligné avec NotificationHistoryTab) */}
            {logs.length > logsPerPage && (
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Affichage de {Math.min(currentPage * logsPerPage, logs.length)} sur {logs.length} logs
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Précédent
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, Math.max(totalPages, 1)))}
                            disabled={currentPage >= totalPages}
                        >
                            Suivant
                        </Button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries({
                    all: logCounts2.totalLogs,
                    normal: logCounts2.normalCount,
                    error: logCounts2.errorCount,
                    warning: logCounts2.warnCount,
                }).map(([level, count]) => (
                    <Card
                        key={level}
                        className={`cursor-pointer transition-all ${
                            selectedLevel === level && level !== 'normal' ? 'ring-2 ring-primary-500' : ''
                        }`}
                        hoverable
                        onClick={() => setSelectedLevel(level)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <div
                                    className={`p-2 rounded-lg ${
                                        level === 'error'
                                            ? 'bg-red-100 dark:bg-red-900'
                                            : level === 'warning'
                                                ? 'bg-yellow-100 dark:bg-yellow-900'
                                                : level === 'normal'
                                                    ? 'bg-green-100 dark:bg-green-900'
                                                    : 'bg-primary-100 dark:bg-primary-900'
                                    }`}
                                >
                                    {level === 'all' ? (
                                        <FileText className="h-5 w-5 text-primary-600" />
                                    ) : (
                                        <div
                                            className={
                                                level === 'error'
                                                    ? 'text-red-600'
                                                    : level === 'warning'
                                                        ? 'text-yellow-600'
                                                        : level === 'normal'
                                                            ? 'text-green-600'
                                                            : 'text-gray-600'
                                            }
                                        >
                                            {getLevelIcon(level)}
                                        </div>
                                    )}
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                                        {level}
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {numberFormatter.format(count)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Carte des filtres */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                    <Filter className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filtres des logs</h3>
                </div>

                <div className="p-5">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleApplyFilters();
                        }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                            {/* Niveau de journal */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-2 text-gray-500" />
                                    Niveau de journal
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedLevel}
                                        onChange={(e) => setSelectedLevel(e.target.value)}
                                        className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="all">Tous niveaux</option>
                                        <option value="NORMAL">Normal</option>
                                        <option value="ERROR">Erreur</option>
                                        <option value="WARN">Avertissement</option>
                                    </select>

                                </div>
                            </div>

                            {/* Nom du job */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                    <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                                    Nom du job
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedJob}
                                        onChange={(e) => setSelectedJob(e.target.value)}
                                        className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="all">Tous les jobs</option>
                                        {jobs.map((job) => (
                                            <option key={job.jobId} value={job.jobName}>
                                                {job.jobName}
                                            </option>
                                        ))}
                                    </select>

                                </div>
                            </div>

                            {/* Nom du nœud */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                    <Server className="h-4 w-4 mr-2 text-gray-500" />
                                    Nom du nœud
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedNode}
                                        onChange={(e) => setSelectedNode(e.target.value)}
                                        className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="all">Tous les nœuds</option>
                                        {nodes.map((node) => (
                                            <option key={node.hostname} value={node.nodename}>
                                                {node.nodename} ({node.hostname})
                                            </option>
                                        ))}
                                    </select>

                                </div>
                            </div>

                            {/* Date de début */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                    Date de début
                                </label>
                                <div className="relative">
                                    <input
                                        type="datetime-local"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>

                            {/* Date de fin */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                    Date de fin
                                </label>
                                <div className="relative">
                                    <input
                                        type="datetime-local"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>

                            {/* Bouton filtrer */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                                >
                                    <Search className="w-4 h-4 mr-2" />
                                    Appliquer les filtres
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Liste des logs */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Entrées de logs
                        </h3>
                        <Badge variant="info">{numberFormatter.format(logs.length)} entrées</Badge>

                        <Button variant="outline" onClick={handleExport}>
                            <Download className="h-4 w-4 mr-2" />
                            Exporter les logs
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {currentLogs.length === 0 ? (
                            <div className="text-center py-8">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">Aucun journal trouvé avec ces filtres</p>
                            </div>
                        ) : (
                            currentLogs.map((log) => (
                                <div
                                    key={log.idLogOutput}
                                    className={`p-4 rounded-lg border-l-4 ${
                                        log.logLevel === 'ERROR'
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                                            : log.logLevel === 'WARN'
                                                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
                                                : log.logLevel === 'NORMAL'
                                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                                                    : 'border-gray-500 bg-gray-50 dark:bg-gray-900/10'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <div className={`p-1 rounded ${getLevelColor(log.logLevel ?? '')}`}>
                                                    {getLevelIcon(log.logLevel ?? '')}
                                                </div>
                                                <Badge variant={getLevelBadge(log.logLevel ?? '')} size="sm">
                                                    {log.logLevel ?? 'N/A'}
                                                </Badge>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {log.createdAt ? new Date(log.createdAt).toLocaleString('fr-FR') : ''}
                                                </span>
                                                {log.jobName && (
                                                    <Badge variant="default" size="sm">
                                                        {log.jobName}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-gray-900 dark:text-gray-100 font-mono text-sm">
                                                <strong>Nom du nœud :</strong> {log.nodename} <strong>Nom d'hôte :</strong> {log.hostname}
                                            </p>
                                            <p className="text-gray-900 dark:text-gray-100 font-mono text-sm">
                                                Numéro de l'étape : {log.stepCtx}
                                            </p>
                                            <p
                                                className={`font-mono text-sm whitespace-pre-wrap ${
                                                    log.logLevel === 'ERROR'
                                                        ? 'text-red-600'
                                                        : log.logLevel === 'WARN'
                                                            ? 'text-yellow-600'
                                                            : log.logLevel === 'NORMAL'
                                                                ? 'text-green-600'
                                                                : 'text-gray-600'
                                                }`}
                                            >
                                                [{log.localTime}] {log.logLevel} : {log.logMessage}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Contrôles de pagination - Bas (aligné avec NotificationHistoryTab) */}
                    {logs.length > logsPerPage && (
                        <div className="flex justify-center items-center gap-4 pt-4">
                            <Button
                                variant="ghost"
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                            >
                                Premier
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Précédent
                            </Button>
                            <span className="text-sm font-medium">
                                Page {currentPage} sur {Math.max(totalPages, 1)}
                            </span>
                            <Button
                                variant="ghost"
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, Math.max(totalPages, 1)))}
                                disabled={currentPage >= totalPages}
                            >
                                Suivant
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setCurrentPage(Math.max(totalPages, 1))}
                                disabled={currentPage >= totalPages}
                            >
                                Dernier
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
