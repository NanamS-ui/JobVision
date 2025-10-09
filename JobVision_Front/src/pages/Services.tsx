import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { MetricChart } from '../components/charts/MetricChart';
import {Activity, Loader2, Plus} from 'lucide-react';

import {createService, fetchServiceMonitoring} from '../api/serviceApi';
import { ServiceMonitoringDTO, ServiceDailySummaryDTO } from '../types/Service.ts';
import PopupMessage from "../components/pop-up/PopupMessage.tsx";
import {useNavigate} from "react-router-dom";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "../components/ui/Dialog.tsx";

export const Services: React.FC = () => {
    useEffect(() => {
        document.title = "Services - JobVision";
    }, []);

    const navigate = useNavigate();
    const [popup, setPopup] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
    const [timeRange, setTimeRange] = useState<string>('7d');

    const [data, setData] = useState<ServiceMonitoringDTO | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const numberFormatter = new Intl.NumberFormat("de-DE", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });

    useEffect(() => {
        setLoading(true);
        setError(null);

        // On utilise 'all' pour serviceName et on mappe le timeRange pour l'API (1d, 7d, 30d)
        let apiTimeRange = 'thisWeek';
        const validTimeRanges = [
            'today',
            'yesterday',
            'thisWeek',
            'lastWeek',
            'thisMonth',
            'lastMonth',
            'thisYear',
            'lastYear',
        ];

        if (validTimeRanges.includes(timeRange)) {
            apiTimeRange = timeRange;
        }


        fetchServiceMonitoring(selectedDepartment === 'all' ? 'all' : selectedDepartment, apiTimeRange)
            .then((res) => {
                console.log('Données reçues:', res);
                setData(res);
            })
            .catch((err) => {
                // Gérer l'erreur spécifique de l'API
                if (err.message.includes('Internal server error') && err.message.includes('datesNode') && err.message.includes('null')) {
                    setError('Aucune donnée disponible pour cette période');
                } else {
                    setError(err.message);
                }
            })
            .finally(() => setLoading(false));


    }, [timeRange, selectedDepartment]);

    // Filtrer les services selon le département sélectionné
    const filteredServices: ServiceDailySummaryDTO[] = data?.serviceDto.filter(s =>
        selectedDepartment === 'all' ? true : s.serviceName.toLowerCase() === selectedDepartment.toLowerCase()
    ) || [];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'healthy': return 'success';
            case 'warning': return 'warning';
            case 'critical': return 'error';
            default: return 'default';
        }
    };

    const translateStatus = (status: string) => {
        switch (status) {
            case 'healthy': return 'Sain';
            case 'warning': return 'Avertissement';
            case 'critical': return 'Critique';
            default: return 'Inconnu';
        }
    };

    // Préparer les données pour le graphique (Response Time)
    // successRate et responseTimeTrends ont comme clé la date, valeur le chiffre
    // Convertir en tableau pour le graphique
    const responseTimeData = data
        ? Object.entries(data.responseTimeTrends).map(([date, value]) => ({ date, responseTime: value }))
        : [];

    const successRateData = data
        ? Object.entries(data.successRate).map(([date, value]) => ({ date, success: value }))
        : [];


    // Nouvel état pour modal ouvert/fermé
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newServiceName, setNewServiceName] = useState('');
    const [newServiceDescription, setNewServiceDescription] = useState('');

    // Fonction d’ouverture / fermeture modal
    const openModal = () => setIsCreateModalOpen(true);
    const closeModal = () => setIsCreateModalOpen(false);

    const handleCreateService = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            await createService(newServiceName, newServiceDescription);

            const updatedData = await fetchServiceMonitoring('all', timeRange);
            setData(updatedData);

            setPopup({ message: 'Service created successfully.', type: 'success' });

            setNewServiceName('');
            setNewServiceDescription('');
            closeModal();
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Unknown error creating service';
            setPopup({ message: errorMessage, type: 'error' });
        } finally {
            setLoading(false);
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Gestion des Services
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Surveillez et gérez les services de l’entreprise par département
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                        <option value="all">Tous les services</option>
                        {/* Liste des départements */}
                        {Array.from(new Set(data?.serviceDto.map(s => s.serviceName) || [])).map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>

                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                        <option value="today">Aujourd’hui</option>
                        <option value="yesterday">Hier</option>
                        <option value="thisWeek">Cette semaine</option>
                        <option value="lastWeek">La semaine dernière</option>
                        <option value="thisMonth">Ce mois-ci</option>
                        <option value="lastMonth">Le mois dernier</option>
                        <option value="thisYear">Cette année</option>
                        <option value="lastYear">L’année dernière</option>
                    </select>

                    <Button onClick={openModal}>
                        <Plus className="w-4 h-4 mr-2" />
                        Créer un service
                    </Button>

                </div>
            </div>

            {loading && <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-green-600 dark:text-green-400" />
                <span className="text-green-600 dark:text-green-400 animate-pulse">
                    Chargement des données...
                </span>
            </div>
            }
            {error && (
                <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                    <div className="text-gray-400 dark:text-gray-500 text-6xl">⚠️</div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                        Aucune donnée disponible
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 text-center max-w-md">
                        Aucune donnée de service n'est disponible pour la période sélectionnée.
                        L'API n'a pas pu récupérer les données pour cette plage de temps.
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                        Essayez de changer la plage de temps ou créez un nouveau service.
                    </p>
                </div>
            )}

            {!loading && !error && (
                <>
                    {!data || (data.serviceDto.length === 0 && Object.keys(data.responseTimeTrends).length === 0 && Object.keys(data.successRate).length === 0) ? (
                        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                            <div className="text-gray-400 dark:text-gray-500 text-6xl">📊</div>
                            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                                Aucune donnée disponible
                            </h3>
                            <p className="text-gray-500 dark:text-gray-500 text-center max-w-md">
                                Aucune donnée de service n'est disponible pour la période sélectionnée.
                                Essayez de changer la plage de temps ou créez un nouveau service.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Aperçu des métriques du service */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            Tendances du temps de réponse
                                        </h3>
                                    </CardHeader>
                                    <CardContent>
                                        {responseTimeData.length > 0 ? (
                                            <MetricChart
                                                data={responseTimeData}
                                                dataKey="responseTime"
                                                title="Temps de réponse (ms)"
                                                color="#ec4899"
                                                height={250}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-[250px] text-gray-500 dark:text-gray-400">
                                                Aucune donnée de temps de réponse disponible
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            Taux de succès
                                        </h3>
                                    </CardHeader>
                                    <CardContent>
                                        {successRateData.length > 0 ? (
                                            <MetricChart
                                                data={successRateData}
                                                dataKey="success"
                                                title="Taux de succès (%)"
                                                color="#a3e635 "
                                                height={250}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-[250px] text-gray-500 dark:text-gray-400">
                                                Aucune donnée de taux de succès disponible
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Liste des services */}
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Statut des services ({filteredServices.length} services)
                                    </h3>
                                </CardHeader>
                                <CardContent>
                                    {filteredServices.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {filteredServices.map((service) => (
                                                <div
                                                    key={service.id}
                                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                                            {service.serviceName}
                                                        </h4>
                                                        <Badge variant={getStatusBadge(service.status)}>
                                                            {translateStatus(service.status)}
                                                        </Badge>
                                                    </div>

                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">Jours rapportés :</span>
                                                            <span className="text-gray-900 dark:text-gray-100">{service.daysReported}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">Nombre total d'exécutions :</span>
                                                            <span className="text-gray-900 dark:text-gray-100">{numberFormatter.format(service.totalExecutions)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">Exécutions réussies :</span>
                                                            <span className="text-gray-900 dark:text-gray-100">{numberFormatter.format(service.successfulExecutions)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">Temps moyen de réponse :</span>
                                                            <span className="text-gray-900 dark:text-gray-100">{numberFormatter.format(service.avgResponseTimeMs)} ms</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">Taux de succès :</span>
                                                            <span className="text-gray-900 dark:text-gray-100">{numberFormatter.format(service.successRatePercent)}%</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">Taux d'erreur :</span>
                                                            <span className="text-gray-900 dark:text-gray-100">{numberFormatter.format(service.errorRatePercent)}%</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                        <div className="flex space-x-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="flex-1"
                                                                onClick={() => navigate(`/services/${service.serviceId}`)}
                                                            >
                                                                Voir les détails
                                                            </Button>

                                                            <Button size="sm" variant="ghost">
                                                                <Activity className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                                            <div className="text-gray-400 dark:text-gray-500 text-4xl">🔍</div>
                                            <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400">
                                                Aucun service trouvé
                                            </h4>
                                            <p className="text-gray-500 dark:text-gray-500 text-center">
                                                Aucun service ne correspond aux critères de filtrage sélectionnés.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    )}
                </>
            )}

            {/* Légende des statuts */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Légende des statuts de service
                    </h3>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/10">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Sain</span>
                                <Badge variant="success">Sain</Badge>
                            </div>
                            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                Taux de succès ≥ 95&nbsp;% et taux d'erreur ≤ 5&nbsp;%.
                            </p>
                        </div>
                        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/10">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Avertissement</span>
                                <Badge variant="warning">Avertissement</Badge>
                            </div>
                            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                Taux de succès ≥ 75% (sinon critique).
                            </p>
                        </div>
                        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/10">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Critique</span>
                                <Badge variant="error">Critique</Badge>
                            </div>
                            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                Taux de succès &lt; 75&nbsp;%.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {isCreateModalOpen && (
                <Dialog open={isCreateModalOpen} onOpenChange={closeModal}>
                    <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Créer un nouveau service
                            </DialogTitle>
                        </DialogHeader>

                        <DialogContent className="p-6 space-y-6">
                            <form onSubmit={handleCreateService} className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label
                                            htmlFor="serviceName"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                        >
                                            Nom <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="serviceName"
                                            type="text"
                                            value={newServiceName}
                                            onChange={e => setNewServiceName(e.target.value)}
                                            required
                                            placeholder="Nom du service"
                                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="serviceDescription"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                        >
                                            Description
                                        </label>
                                        <textarea
                                            id="serviceDescription"
                                            value={newServiceDescription}
                                            onChange={e => setNewServiceDescription(e.target.value)}
                                            rows={3}
                                            placeholder="Description du service (optionnel)"
                                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={closeModal}
                                        className="px-4 py-2 text-sm font-medium"
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium"
                                    >
                                        Créer le service
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
