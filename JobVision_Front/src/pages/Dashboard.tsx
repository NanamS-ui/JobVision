import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { MetricChart } from '../components/charts/MetricChart';
import {
    Activity,
    Clock,
    CheckCircle,
    XCircle,
    LayoutDashboard,
    Download,
    BarChart2,
    Copy,
    Loader2,
    RefreshCw,
    FileText,
    Filter
} from 'lucide-react';
import { StatusChart } from "../components/charts/StatusChartProps.tsx";
import { DashboardDTO } from "../types/Dashboard.ts";
import {fetchDashboard, fetchDashboardByDate, fetchDashboardExecution} from "../api/dashboardApi.ts";
import {BarChart} from "../components/charts/BarChart.tsx";
import {downloadLogsXls} from "../api/logApi.ts";
import {Button} from "../components/ui/Button.tsx";
import PopupMessage from "../components/pop-up/PopupMessage.tsx";
import { DateRangePicker } from '../components/ui/DateRangePicker';

export const Dashboard: React.FC = () => {
    const numberFormatter = new Intl.NumberFormat("de-DE");
    const [timeRange, setTimeRange] = useState<string>('thisMonth');
    const [dashboardData, setDashboardData] = useState<DashboardDTO | null>(null);
    const [dashboardDataExec, setDashboardDataExec] = useState<DashboardDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [popupContent, setPopupContent] = useState<{title?: string; message: string; type?: 'success' | 'error' | 'info' | 'warning'} | null>(null);
    const [showPopup, setShowPopup] = useState(false);

    async function loadDashboardExecution() {
        try {
            setLoading(true);
            const data = await fetchDashboardExecution();
            setDashboardDataExec(data);
            setError(null);
        } catch (err: any) {
            // Gérer l'erreur spécifique de l'API
            const errorMessage = err.message || "Erreur lors du chargement";
            if (errorMessage.includes('Internal server error') && errorMessage.includes('datesNode') && errorMessage.includes('null')) {
                setError('Aucune donnée disponible pour cette période');
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboardExecution();
    }, []);
    useEffect(() => {
        document.title = "Tableau de Bord - JobVision";
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchDashboard(timeRange);
                setDashboardData(data);
                setError(null);
            } catch (error: any) {
                // Gérer l'erreur spécifique de l'API
                const errorMessage = error.message || "Impossible de récupérer les données du tableau de bord.";
                if (errorMessage.includes('Internal server error') && errorMessage.includes('datesNode') && errorMessage.includes('null')) {
                    setError('Aucune donnée disponible pour cette période');
                } else {
                    setError(errorMessage);
                }
            }
        };
        loadData();
    }, [timeRange]);

    const chartData = (dashboardData?.statusDistribution ?? []).map((job: any) => ({
        projectName: job.status,
        count: job.count /1000
    }));

    const getTimeRangeOptions = () => [
        { value: '12h', title: 'Dernières 12 heures' },
        { value: 'today', title: "Aujourd'hui" },
        { value: 'yesterday', title: 'Hier' },
        { value: 'thisWeek', title: 'Cette semaine' },
        { value: 'lastWeek', title: 'La semaine dernière' },
        { value: 'thisMonth', title: 'Ce mois-ci' },
        { value: 'lastMonth', title: 'Le mois dernier' },
        { value: 'thisYear', title: "Cette année" },
        { value: 'lastYear', title: "L'année dernière" },
        { value: '2y', title: 'Les 2 dernières années' },
        { value: '5y', title: 'Les 5 dernières années' }
    ];

    // Transforme les executionsByDay pour MetricChart (qui attend "jobs" comme clé)
    const executionsByDayData = dashboardData?.executionsByDay.map(item => ({
        jobs: item.count,
        date: new Date(parseInt(item.date)).toLocaleDateString()
    })) || [];

    // Données pour la distribution des statuts globaux
    const statusDistributionData = dashboardData?.executionStatusToday.map(item => ({
        name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        value: item.count,
        color: item.status === 'succeeded' ? '#22c55e' : '#ef4444'
    })) || [];

    const stats = [
        {
            name: "Jobs actifs",
            value: dashboardData ? numberFormatter.format(dashboardData.activeJobs) : "0",
            icon: Activity,
            color: "text-primary-600",
            bgColor: "bg-primary-100 dark:bg-primary-900",
        },
        {
            name: "Durée moyenne (s)",
            value: dashboardData
                ? numberFormatter.format(Number((dashboardData.avgDurationThisMonth / 1000).toFixed(2)))
                : "0",
            icon: Clock,
            color: "text-blue-600",
            bgColor: "bg-blue-100 dark:bg-blue-900",
        },
        {
            name: "Taux de succès (%)",
            value: dashboardData
                ? `${numberFormatter.format(Number(dashboardData.successRateToday.toFixed(2)))}%`
                : "0%",
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-100 dark:bg-green-900",
        },
        {
            name: "Exécutions",
            value: dashboardData ? numberFormatter.format(dashboardData.totalExecutionsToday) : "0",
            icon: LayoutDashboard,
            color: "text-purple-600",
            bgColor: "bg-purple-100 dark:bg-purple-900",
        },
    ];

    const handleFilter = async () => {
        if (startDate && endDate && startDate > endDate) {
            setPopupContent({
                title: "Plage de dates invalide",
                message: "La date de fin ne peut pas être antérieure à la date de début.",
                type: "error"
            });
            setShowPopup(true);
            return;
        }

        if (!startDate && endDate) {
            setPopupContent({
                title: "Date de début manquante",
                message: "Veuillez sélectionner une date de début avant de choisir une date de fin.",
                type: "error"
            });
            setShowPopup(true);
            return;
        }

        try {
            const filteredData = await fetchDashboardByDate(startDate, endDate);
            setDashboardData(filteredData);
            setError(null);
            setPopupContent({
                title: "Filtre appliqué",
                message: `Données chargées pour la période du ${startDate} au ${endDate}.`,
                type: "success"
            });
            setShowPopup(true);
        } catch (error: any) {
            setPopupContent({
                title: "Erreur",
                message: error.message || "Erreur lors de la récupération des données filtrées.",
                type: "error"
            });
            setShowPopup(true);
        }
    };


    async function triggerLogsXlsDownload(executionId: number): Promise<void> {
        try {
            const blob = await downloadLogsXls(executionId);
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `logs_execution_${executionId}.xls`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Erreur lors du téléchargement du fichier XLS :", error);
        }
    }

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
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-2">
                        <div className="space-y-1 flex items-center gap-2">
                            <LayoutDashboard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
                        </div>

                        <div className="flex flex-wrap items-end gap-4 w-full lg:w-auto">
                            <div className="flex flex-col min-w-[180px]">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                                    Plage temporelle
                                </label>
                                <select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value)}
                                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                >
                                    {getTimeRangeOptions().map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <DateRangePicker
                                startDate={startDate}
                                endDate={endDate}
                                onStartDateChange={setStartDate}
                                onEndDateChange={setEndDate}
                            />

                            <div className="flex flex-col">
                                <label className="text-xs font-medium text-transparent mb-1 uppercase tracking-wider">
                                    Action
                                </label>
                                <Button onClick={handleFilter}>
                                    <Filter className="h-4 w-4" />
                                    <span>Appliquer les filtres</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                    <div className="text-gray-400 dark:text-gray-500 text-6xl">⚠️</div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                        Aucune donnée disponible
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 text-center max-w-md">
                        Aucune donnée de tableau de bord n'est disponible pour la période sélectionnée. 
                        L'API n'a pas pu récupérer les données pour cette plage de temps.
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                        Essayez de changer la plage de temps ci-dessus ou vérifiez la configuration.
                    </p>
                </div>
            </div>
        );
    }
    return (
        <>
        {showPopup && popupContent && (
            <PopupMessage
                title={popupContent.title}
                message={popupContent.message}
                type={popupContent.type}
                onClose={() => setShowPopup(false)}
                duration={4000}
                position="top-right"
                size="md"
                showIcon={true}
                animated={true}
            />
        )}

    <div className="space-y-6">

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-2">
                    <div className="space-y-1 flex items-center gap-2">
                        <LayoutDashboard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
                    </div>

                    <div className="flex flex-wrap items-end gap-4 w-full lg:w-auto">
                        <div className="flex flex-col min-w-[180px]">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                                Plage temporelle
                            </label>
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            >
                                {getTimeRangeOptions().map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <DateRangePicker
                            startDate={startDate}
                            endDate={endDate}
                            onStartDateChange={setStartDate}
                            onEndDateChange={setEndDate}
                        />

                        <div className="flex flex-col">
                            <label className="text-xs font-medium text-transparent mb-1 uppercase tracking-wider">
                                Action
                            </label>
                            <Button onClick={handleFilter}>
                                <Filter className="h-4 w-4" />
                                <span>Appliquer les filtres</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.name} hoverable>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
                                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stat.value}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Exécutions Par Jour</h3>
                    </CardHeader>
                    <CardContent>
                        <MetricChart data={executionsByDayData} dataKey="jobs" title="Jobs" color="#10b981" height={250} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Distribution des statuts</h3>
                    </CardHeader>
                    <CardContent>
                        <StatusChart data={statusDistributionData} height={200} />
                    </CardContent>
                </Card>
            </div>

            {/* Global Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Top 5 Jobs les plus longs par Durée d’Exécution (secondes)
                        </h3>
                    </CardHeader>
                    <CardContent className="max-h-[400px] overflow-y-auto pr-2">
                        <BarChart
                            data={chartData}
                            title="Top 5 jobs les plus longs"
                            height={350}
                            color="#06b6d4"
                            showValues={true}
                        />
                    </CardContent>
                </Card>

                {/* Optionnel : Distribution par projet */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Répartition exécutions par projet
                        </h3>
                    </CardHeader>
                    <CardContent className="max-h-[400px] overflow-y-auto pr-2">
                        {dashboardData?.projectDistribution ? (
                            <BarChart
                                data={dashboardData.projectDistribution}
                                title="Nombre exécutions par projet"
                                height={200}
                                color="#22c55e"
                                showValues={true}
                            />
                        ) : (
                            <p>Aucune donnée disponible.</p>
                        )}
                    </CardContent>
                </Card>
            </div>


            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Exécutions récentes
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {dashboardDataExec?.recentExecutions.length || 0} exécution{dashboardDataExec?.recentExecutions.length !== 1 ? 's' : ''} trouvée{dashboardDataExec?.recentExecutions.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                                onClick={() => loadDashboardExecution()}
                            >
                                <RefreshCw className="h-4 w-4" />
                                Actualiser
                            </button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-left">
                            <tr>
                                <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Job
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2">
                                        <LayoutDashboard className="h-4 w-4" />
                                        Projet
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Début
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Fin
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-right">
                                    <div className="flex items-center gap-2 justify-end">
                                        <Activity className="h-4 w-4" />
                                        Durée
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Statut
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 text-center">
                                    <div className="flex items-center gap-2 justify-center">
                                        <Download className="h-4 w-4" />
                                        Actions
                                    </div>
                                </th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {dashboardDataExec?.recentExecutions.map(exec => {
                                const Icon = exec.status === 'succeeded' ? CheckCircle : XCircle;
                                const color = exec.status === 'succeeded' ? 'text-green-500' : 'text-red-500';
                                const duration = (exec.durationMs / 1000).toFixed(2);
                                const startDate = new Date(exec.dateStarted);
                                const endDate = new Date(exec.dateEnded);
                                const isLongExecution = parseFloat(duration) > 10;

                                return (
                                    <tr
                                        key={exec.executionId}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                                    >
                                        <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium border-b border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0">
                                                    <div className={`w-2 h-2 rounded-full ${exec.status === 'succeeded' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate max-w-[200px] font-medium">{exec.jobName}</span>
                                                        <button
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                            onClick={() => navigator.clipboard.writeText(exec.jobName)}
                                                            title="Copier le nom"
                                                        >
                                                            <Copy className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        ID: {exec.executionId}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                {exec.projectName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {startDate.toLocaleDateString('fr-FR')}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {startDate.toLocaleTimeString('fr-FR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {endDate.toLocaleDateString('fr-FR')}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {endDate.toLocaleTimeString('fr-FR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className={`font-semibold text-sm ${
                                                    isLongExecution ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                                                }`}>
                                                    {duration}s
                                                </span>
                                                {isLongExecution && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                        Long
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-2">
                                                <Icon className={`h-4 w-4 ${color}`} />
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    exec.status === 'succeeded'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                    {exec.status === 'succeeded' ? 'Succès' : 'Échec'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => triggerLogsXlsDownload(exec.executionId)}
                                                    className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                                                    title="Exporter les logs"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(exec.executionId.toString())}
                                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                                                    title="Copier l'ID d'exécution"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>

                    {!dashboardDataExec?.recentExecutions.length && (
                        <div className="p-12 text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col items-center justify-center gap-4">
                                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                                    <BarChart2 className="h-8 w-8 text-gray-400" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                        Aucune exécution récente
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                                        Aucune exécution n'a été trouvée. Les exécutions récentes apparaîtront ici une fois qu'elles auront été lancées.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
        </>
    );
};
