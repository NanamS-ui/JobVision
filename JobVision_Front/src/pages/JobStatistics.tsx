import React, {useEffect, useState} from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { MetricChart } from '../components/charts/MetricChart';
import {
    TrendingUp,
    BarChart3,
    PieChart,
    Activity,
    Clock,
    CheckCircle,
    XCircle,
    Zap,
    Users, Filter, BarChart2,

} from 'lucide-react';
import {StatusChart} from "../components/charts/StatusChartProps.tsx";
import {BarChart} from "../components/charts/BarChart.tsx";
import {GlobalStatsDTO} from "../types/GlobalStatsDTO.ts";
import {fetchGlobalStats, fetchGlobalStatsByDate} from "../api/jobApi.ts";
import {fetchAllServices} from "../api/serviceApi.ts";
import {ServiceDTO} from "../types/Service.ts";
import {PriorityJobsTable} from "../components/job/priority/PriorityJobsTable.tsx";
import {Button} from "../components/ui/Button.tsx";
import PopupMessage from "../components/pop-up/PopupMessage.tsx";
import {DateRangePicker} from "../components/ui/DateRangePicker.tsx";
export const JobStatistics: React.FC = () => {
    useEffect(() => {
        document.title = "Job Stats General - JobVision";
    }, []);

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

    const [stats, setStats] = useState<GlobalStatsDTO | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
    const [services, setServices] = useState<ServiceDTO[]>([]);
    const [timeRange, setTimeRange] = useState<string>('thisMonth');

    useEffect(() => {
        const loadServices = async () => {
            try {
                const data = await fetchAllServices();
                setServices(data);
            } catch (err) {
                console.error('Failed to fetch services:', err);
            }
        };
        loadServices();
    }, []);

    useEffect(() => {
        fetchGlobalStats(selectedDepartment, timeRange)
            .then(setStats)
            .catch(console.error);
    }, [selectedDepartment, timeRange]);

    console.log(stats);

    const performanceMetrics = (stats: {
        totalExecutions: number;
        totalSucceeded: number;
        totalFailed: number;
        totalRunning: number;
        averageExecutionTime: number;
    }) => {
        const successRate = stats.totalExecutions > 0
            ? ((stats.totalSucceeded / stats.totalExecutions) * 100).toFixed(2)
            : '0.00';

        const failureRate = stats.totalExecutions > 0
            ? ((stats.totalFailed / stats.totalExecutions) * 100).toFixed(2)
            : '0.00';

        const avgDuration = stats.averageExecutionTime.toFixed(2) ?? 0;

        const numberFormatter = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 2 });

        return [
            {
                title: 'Taux de réussite moyen',
                value: `${numberFormatter.format(Number(successRate))}%`,
                change: '+2,3%',
                trend: 'up',
                icon: CheckCircle,
                color: 'text-green-600'
            },
            {
                title: "Taux d'échec",
                value: `${numberFormatter.format(Number(failureRate))}%`,
                change: '-1,1%',
                trend: 'down',
                icon: XCircle,
                color: 'text-red-600'
            },
            {
                title: 'Durée moyenne',
                value: `${numberFormatter.format(Number(avgDuration))} s`,
                change: '-5,2%',
                trend: 'down',
                icon: Clock,
                color: 'text-blue-600'
            },
            {
                title: 'Jobs actifs',
                value: numberFormatter.format(stats.totalRunning),
                change: '+12%',
                trend: 'up',
                icon: Activity,
                color: 'text-primary-600'
            }
        ];

    };


    const projectDistributionData =
        stats?.projectDistribution.map((item) => ({
            projectName: item.projectName,
            count: item.executionCount,
        })) ?? [];

    const statusDistributionData =
        stats?.statusDistribution.map((item) => ({
            name: item.status,
            value: item.count,
            color: item.status === 'succeeded' ? '#16a34a' :
                item.status === 'failed' ? '#dc2626' : '#facc15'
        })) ?? [];

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [popupContent, setPopupContent] = useState<{ message: string; type: 'error' | 'info' | 'success', title?: string } | null>(null);

    const handleFilter = async () => {
        // Validation
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
            const data = await fetchGlobalStatsByDate(selectedDepartment, startDate, endDate);
            setStats(data);

        } catch (error) {
            console.error("Failed to fetch filtered statistics", error);
            setPopupContent({
                title: "Error Fetching Data",
                message: "An error occurred while retrieving statistics. Please try again.",
                type: "error"
            });
            setShowPopup(true);
        }
    };

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

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-2">
                    {/* Section titre */}
                    <div className="space-y-1">
                        <BarChart2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suivi générale des jobs</h1>
                    </div>

                    {/* Filtres */}
                    <div className="flex flex-wrap items-end gap-4 w-full lg:w-auto">
                        {/* Plage temporelle */}
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

                        {/* Service */}
                        <div className="flex flex-col min-w-[180px]">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                                Service
                            </label>
                            <select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            >
                                <option value="all">Tous les services</option>
                                {services.map((service) => (
                                    <option key={service.id} value={String(service.id)}>
                                        {service.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Plage de dates */}
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
                            <Button
                                onClick={handleFilter}
                            >
                                <Filter className="h-4 w-4" />
                                <span>Appliquer les filtres</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Métriques de performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats && performanceMetrics(stats).map((metric) => (
                    <Card key={metric.title} hoverable>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {metric.title}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                        {metric.value}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-700 ${metric.color}`}>
                                    <metric.icon className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Graphiques principaux */}
            {stats &&(
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                    <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
                                    Tendances d'exécution
                                </h3>
                            </CardHeader>
                            <CardContent>
                                <MetricChart
                                    data={stats.dailyExecutions}
                                    dataKey="count"
                                    nameKey="date"
                                    title="Exécutions"
                                    height={300}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                    <PieChart className="h-5 w-5 mr-2 text-primary-600" />
                                    Répartition des statuts
                                </h3>
                            </CardHeader>
                            <CardContent>
                                <StatusChart
                                    data={statusDistributionData}
                                    height={300}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Graphiques secondaires */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                    <BarChart3 className="h-5 w-5 mr-2 text-primary-600" />
                                    Taux de réussite au fil du temps
                                </h3>
                            </CardHeader>
                            <CardContent>
                                <MetricChart
                                    data={stats.dailyAverageDurations}
                                    dataKey="averageDuration"
                                    nameKey="date"
                                    title="Exécutions"
                                    height={300}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                    <Users className="h-5 w-5 mr-2 text-primary-600" />
                                    Répartition exécutions par projet
                                </h3>
                            </CardHeader>
                            <CardContent>
                                <BarChart
                                    data={projectDistributionData}
                                    title="Répartition par projet"
                                    height={300}
                                    color="#22c55e"
                                    showValues={true}
                                    showPercentage={true}
                                    maxItems={8}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <Zap className="h-5 w-5 mr-2 text-primary-600" />
                        Jobs prioritaires
                    </h3>
                </CardHeader>
                <CardContent>
                    <PriorityJobsTable />
                </CardContent>
            </Card>
        </div>
    );
};