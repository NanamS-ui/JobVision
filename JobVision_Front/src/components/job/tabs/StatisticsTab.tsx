import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { StatisticsByJobDTO } from "../../../types/StatisticsByJobDTO.ts";
import { StatusDistributionDTO } from "../../../types/StatusDistributionDTO.ts";
import { StatusChart } from '../../charts/StatusChartProps.tsx';
import { MetricChart } from "../../charts/MetricChart.tsx";
import {fetchStatisticsByJobByDate, getJobStatistics} from "../../../api/jobApi.ts";
import {
    Activity,
    AlertCircle,
    BarChart2,
    Calendar, CalendarRange,
    CheckCircle,
    Clock, Filter, Loader2,
    RefreshCw,
    TrendingUp,
    XCircle
} from 'lucide-react';
import {Button} from "../../ui/Button.tsx";
import PopupMessage from "../../pop-up/PopupMessage.tsx";

const timeRanges = [
    { value: '12h', label: 'Dernières 12 heures' },
    { value: 'today', label: 'Aujourd’hui' },
    { value: 'yesterday', label: 'Hier' },
    { value: 'thisWeek', label: 'Cette semaine' },
    { value: 'lastWeek', label: 'La semaine dernière' },
    { value: 'thisMonth', label: 'Ce mois-ci' },
    { value: 'lastMonth', label: 'Le mois dernier' },
    { value: 'thisYear', label: 'Cette année' },
    { value: 'lastYear', label: 'L’année dernière' },
    { value: '2y', label: 'Les 2 dernières années' },
    { value: '5y', label: 'Les 5 dernières années' }
];

export const StatisticsTab: React.FC<{ jobId: number, isActive: boolean; }> = ({ jobId, isActive }) => {
    const numberFormatter = new Intl.NumberFormat("de-DE");
    const [stats, setStats] = useState<StatisticsByJobDTO | null>(null);
    const [loading, setLoading] = useState(false);
    const [range, setRange] = useState('thisWeek');
    const [popup, setPopup] = useState<{ message: string; type: 'error' | 'info' } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getJobStatistics(jobId, range);
            setStats(data);
        } catch (error: any) {
            // Gérer l'erreur spécifique de l'API
            const errorMessage = error.message || "Erreur lors du chargement des statistiques";
            if (errorMessage.includes('Internal server error') && errorMessage.includes('datesNode') && errorMessage.includes('null')) {
                setError('Aucune donnée disponible pour cette période');
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isActive) return;
        fetchStats();
    }, [range]);

    const pieData = (stats?.statusDistribution || []).map((s: StatusDistributionDTO) => ({
        name: s.status,
        value: s.count,
        color:
            s.status === 'succeeded' ? '#16a34a' :
                s.status === 'failed' ? '#dc2626' :
                    '#facc15'
    }));

    const [dateDebut, setDateDebut] = useState("");
    const [dateFin, setDateFin] = useState("");

    const handleFilter = async () => {
        if (!dateDebut || !dateFin) {
            setPopup({ message: 'Les dates de début et de fin sont obligatoires.', type: 'error' });
            return;
        }

        if (new Date(dateDebut) > new Date(dateFin)) {
            setPopup({ message: 'La date de début ne peut pas être postérieure à la date de fin.', type: 'error' });
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await fetchStatisticsByJobByDate(jobId, dateDebut, dateFin);
            setStats(data);
        } catch (error: any) {
            // Gérer l'erreur spécifique de l'API
            const errorMessage = error.message || "Erreur lors de la récupération des statistiques";
            if (errorMessage.includes('Internal server error') && errorMessage.includes('datesNode') && errorMessage.includes('null')) {
                setError('Aucune donnée disponible pour cette plage de dates');
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-green-600 dark:text-green-400" />
        <span className="text-green-600 dark:text-green-400 animate-pulse">
            Chargement des données...
          </span>
    </div>

    if (error) {
        return (
            <div className="space-y-6">
                {/* En-tête avec sélecteur de plage */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <BarChart2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Suivi du Job</h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchStats}
                            disabled={loading}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>

                        <div className="relative flex items-center">
                            <Clock className="absolute left-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <select
                                value={range}
                                onChange={(e) => setRange(e.target.value)}
                                className="pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm rounded-md text-gray-900 dark:text-gray-100 appearance-none transition-colors"
                            >
                                {timeRanges.map((r) => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* État de chargement */}
                <div className="mb-6 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
                    <div className="flex flex-col md:flex-row items-end gap-4 md:gap-6">

                        {/* Date de début */}
                        <div className="flex-1">
                            <label
                                htmlFor="dateDebut"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Date de début
                            </label>
                            <div className="mt-1 relative">
                                <CalendarRange className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="date"
                                    id="dateDebut"
                                    value={dateDebut}
                                    onChange={(e) => setDateDebut(e.target.value)}
                                    className="pl-10 pr-3 py-2 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Date de fin */}
                        <div className="flex-1">
                            <label
                                htmlFor="dateFin"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Date de fin
                            </label>
                            <div className="mt-1 relative">
                                <CalendarRange className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="date"
                                    id="dateFin"
                                    value={dateFin}
                                    onChange={(e) => setDateFin(e.target.value)}
                                    className="pl-10 pr-3 py-2 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Bouton Filtrer */}
                        <div className="mt-1">
                            <label className="block text-sm font-medium text-transparent">Filtrer</label> {/* label espacement */}
                            <Button onClick={handleFilter}>
                                <Filter className="h-4 w-4" />
                                Filtrer
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                    <div className="text-gray-400 dark:text-gray-500 text-6xl">⚠️</div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                        Aucune donnée disponible
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 text-center max-w-md">
                        Aucune donnée de statistiques n'est disponible pour ce job et la période sélectionnée. 
                        L'API n'a pas pu récupérer les données pour cette plage de temps.
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                        Essayez de changer la plage de temps ou les dates ci-dessus, ou vérifiez la configuration.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {popup && (
                <PopupMessage
                    message={popup.message}
                    type={popup.type}
                    onClose={() => setPopup(null)}
                    title="Erreur de validation"
                    position="top-center"
                    animated
                />
            )}

            {/* En-tête avec sélecteur de plage */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <BarChart2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Suivi du Job</h2>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchStats}
                        disabled={loading}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    <div className="relative flex items-center">
                        <Clock className="absolute left-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <select
                            value={range}
                            onChange={(e) => setRange(e.target.value)}
                            className="pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm rounded-md text-gray-900 dark:text-gray-100 appearance-none transition-colors"
                        >
                            {timeRanges.map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* État de chargement */}
            <div className="mb-6 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
                <div className="flex flex-col md:flex-row items-end gap-4 md:gap-6">

                    {/* Date de début */}
                    <div className="flex-1">
                        <label
                            htmlFor="dateDebut"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Date de début
                        </label>
                        <div className="mt-1 relative">
                            <CalendarRange className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="date"
                                id="dateDebut"
                                value={dateDebut}
                                onChange={(e) => setDateDebut(e.target.value)}
                                className="pl-10 pr-3 py-2 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Date de fin */}
                    <div className="flex-1">
                        <label
                            htmlFor="dateFin"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Date de fin
                        </label>
                        <div className="mt-1 relative">
                            <CalendarRange className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="date"
                                id="dateFin"
                                value={dateFin}
                                onChange={(e) => setDateFin(e.target.value)}
                                className="pl-10 pr-3 py-2 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Bouton Filtrer */}
                    <div className="mt-1">
                        <label className="block text-sm font-medium text-transparent">Filtrer</label> {/* label espacement */}
                        <Button onClick={handleFilter}>
                            <Filter className="h-4 w-4" />
                            Filtrer
                        </Button>
                    </div>
                </div>
            </div>

            {/* Contenu des statistiques */}
            {!loading && !error && stats && (
                <>
                    {/* Cartes résumé */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 transition-colors">
                            <CardHeader className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                                <Activity className="h-5 w-5 text-blue-500" />
                                <span>Total des exécutions</span>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {numberFormatter.format(stats.totalExecutions)}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 transition-colors">
                            <CardHeader className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span>Taux de réussite</span>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {numberFormatter.format(stats.successRate)}%
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 transition-colors">
                            <CardHeader className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                                <XCircle className="h-5 w-5 text-red-500" />
                                <span>Taux d'échec</span>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {numberFormatter.format(stats.failureRate)}%
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 transition-colors">
                            <CardHeader className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                                <Clock className="h-5 w-5 text-purple-500" />
                                <span>Durée moyenne</span>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {numberFormatter.format(stats.averageDuration)} ms
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Section graphiques */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 transition-colors">
                            <CardHeader className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                                <TrendingUp className="h-5 w-5 text-indigo-500" />
                                <span>Répartition des statuts</span>
                            </CardHeader>
                            <CardContent className="h-80">
                                <StatusChart data={pieData} />
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 transition-colors">
                            <CardHeader className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                                <AlertCircle className="h-5 w-5 text-amber-500" />
                                <span>Activité horaire</span>
                            </CardHeader>
                            <CardContent className="h-80">
                                <MetricChart
                                    data={stats.hourlyActivity}
                                    dataKey="count"
                                    nameKey="hour"
                                    title="Exécutions"
                                    height={300}
                                />
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 transition-colors">
                            <CardHeader className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                                <Calendar className="h-5 w-5 text-teal-500" />
                                <span>Exécutions par jour</span>
                            </CardHeader>
                            <CardContent className="h-80">
                                <MetricChart
                                    data={stats.dailyExecutions}
                                    dataKey="count"
                                    nameKey="date"
                                    title="Exécutions"
                                />
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 transition-colors">
                            <CardHeader className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                                <Clock className="h-5 w-5 text-blue-500" />
                                <span>Durée moyenne par jour</span>
                            </CardHeader>
                            <CardContent className="h-80">
                                <MetricChart
                                    data={stats.dailyAverageDuration}
                                    dataKey="averageDuration"
                                    nameKey="date"
                                    title="Durée (ms)"
                                    color="#3b82f6"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
};