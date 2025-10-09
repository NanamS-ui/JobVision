import React, { useState } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, XCircle, Eye, BarChart3 } from 'lucide-react';

interface StatusChartProps {
    data: { name: string; value: number; color: string }[];
    height?: number;
    showLegend?: boolean;
    showTotal?: boolean;
    emptyMessage?: string;
    loading?: boolean;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    total?: number;
}

export const StatusChart: React.FC<StatusChartProps> = ({ 
    data, 
    height = 240,
    showLegend = true,
    showTotal = true,
    emptyMessage = "Aucune donnée disponible",
    loading = false
}) => {
    const [showLegendFirst, setShowLegendFirst] = useState(false);
    const total = data.reduce((acc, curr) => acc + curr.value, 0);

    const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, total }) => {
        if (active && payload && payload.length) {
            const { name, value, color } = payload[0];
            const percent = total ? ((value / total) * 100).toFixed(1) : '0';
            
            return (
                <div className="backdrop-blur-md bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-600 p-4 rounded-xl shadow-xl text-sm space-y-2 transition-all duration-200 z-50">
                    <div className="flex items-center gap-2">
                        <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: color }}
                        />
                        <span className="font-semibold text-gray-900 dark:text-white">{name}</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-600 dark:text-gray-300 text-xs">Valeur</p>
                        <p className="text-gray-900 dark:text-white font-bold text-lg">
                            {value.toLocaleString()}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                            {percent}% du total
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    // État de chargement
    if (loading) {
        return (
            <div className="flex items-center justify-center h-[240px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Chargement...</p>
                </div>
            </div>
        );
    }

    // État vide
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[240px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    // Fonction pour obtenir l'icône de statut
    const getStatusIcon = (name: string) => {
        const status = name.toLowerCase();
        switch (status) {
            case 'success':
            case 'succeeded':
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'failed':
            case 'error':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'aborted':
            case 'cancelled':
            case 'stopped':
                return <XCircle className="w-4 h-4 text-orange-500" />;
            case 'running':
            case 'in_progress':
            case 'pending':
                return <TrendingUp className="w-4 h-4 text-blue-500" />;
            default:
                return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
        }
    };

    return (
        <div className="relative w-full h-full">
            {/* Bouton de basculement */}
            <div className="absolute top-2 right-2 z-20">
                <button
                    onClick={() => setShowLegendFirst(!showLegendFirst)}
                    className={`p-2 rounded-full transition-all duration-200 ${
                        showLegendFirst 
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    } hover:scale-105`}
                    title={showLegendFirst ? "Afficher le graphique" : "Afficher la légende"}
                >
                    {showLegendFirst ? <BarChart3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>

            {/* Graphique */}
            <div className={`transition-all duration-300 ${showLegendFirst ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}`}>
                <ResponsiveContainer width="100%" height={height}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={3}
                            dataKey="value"
                            startAngle={90}
                            endAngle={450}
                            isAnimationActive
                            animationDuration={1000}
                            animationEasing="ease-out"
                            label={({ value }) => {
                                const percent = total > 0 ? ((value / total) * 100) : 0;
                                return percent > 8 ? `${Math.round(percent)}%` : '';
                            }}
                            labelLine={false}
                        >
                            {data.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.color}
                                    stroke="#ffffff"
                                    strokeWidth={2}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip total={total} />} />
                    </PieChart>
                </ResponsiveContainer>

                {/* Informations centrales */}
                {showTotal && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                {total.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                Total
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Légende améliorée */}
            {showLegend && data.length > 0 && (
                <div className={`absolute inset-0 transition-all duration-300 ${
                    showLegendFirst 
                        ? 'opacity-100 scale-100 z-10' 
                        : 'opacity-0 scale-95 pointer-events-none'
                }`}>
                    <div className="h-full flex flex-col justify-center p-4">
                        <div className="bg-white/95 dark:bg-gray-800/95 rounded-lg p-4 backdrop-blur-sm border border-gray-200 dark:border-gray-600 shadow-lg">
                            <div className="text-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                    Répartition détaillée
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Total: {total.toLocaleString()}
                                </p>
                            </div>
                            <div className="space-y-3">
                                {data.map((item, index) => {
                                    const percent = total > 0 ? ((item.value / total) * 100) : 0;
                                    return (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(item.name)}
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="w-4 h-4 rounded-full" 
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                                        {item.name}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold text-gray-900 dark:text-white">
                                                    {item.value.toLocaleString()}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {percent.toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
