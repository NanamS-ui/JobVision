import React from 'react';

interface BarChartData {
    projectName: string;
    count: number;
}

interface BarChartProps {
    data: BarChartData[];
    title?: string;
    height?: number;
    color?: string;
    showValues?: boolean;
    className?: string;
    showPercentage?: boolean;
    maxItems?: number;
}
export const BarChart: React.FC<BarChartProps> = ({
                                                      data,
                                                      height = 300,
                                                      color = '#3b82f6',
                                                      showValues = true,
                                                      className = '',
                                                      showPercentage = true,
                                                      maxItems = 10
                                                  }) => {
    if (!data || data.length === 0) {
        return (
            <div className={`flex items-center justify-center ${className}`} style={{ height }}>
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">
                        Aucune donnée disponible
                    </div>
                </div>
            </div>
        );
    }

    // formatter global au composant
    const numberFormatter = new Intl.NumberFormat("de-DE");
    const sortedData = [...data]
        .sort((a, b) => b.count - a.count)
        .slice(0, maxItems);

    const maxValue = Math.max(...sortedData.map(item => item.count));
    const total = sortedData.reduce((sum, item) => sum + item.count, 0);

    const generateColors = (baseColor: string, count: number) => {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const opacity = 0.9 - (i * 0.08);
            colors.push(`${baseColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`);
        }
        return colors;
    };

    const colors = sortedData.length > 1 ? generateColors(color, sortedData.length) : [color];

    return (
        <div className={`w-full flex flex-col gap-4 ${className}`}>
            {sortedData.map((item, index) => {
                const percentage = maxValue > 0 ? (item.count / maxValue) * 100 : 0;
                const totalPercentage = total > 0 ? ((item.count / total) * 100) : 0;

                return (
                    <div key={item.projectName} className="group">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                                <div
                                    className="w-4 h-4 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: colors[index % colors.length] }}
                                />
                                <div className="min-w-0 flex-1">
                                    {/* texte tronqué avec tooltip */}
                                    <span
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate block"
                                        title={item.projectName}
                                    >
                                        {item.projectName}
                                    </span>
                                    {showPercentage && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {totalPercentage.toFixed(1)}% du total
                                        </span>
                                    )}
                                </div>
                            </div>
                            {showValues && (
                                <div className="flex items-center space-x-2 text-sm ml-4">
                                    <span className="font-bold text-gray-900 dark:text-gray-100">
                                        {numberFormatter.format(item.count)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* barre */}
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700 ease-out group-hover:opacity-90 relative"
                                style={{
                                    width: `${percentage}%`,
                                    backgroundColor: colors[index % colors.length],
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* résumé */}
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-600 dark:text-gray-400">
                        Résultats affichés: {sortedData.length}
                    </span>

                        {data.length > maxItems && (
                            <span className="text-gray-500 dark:text-gray-500 text-xs">
                                +{data.length - maxItems} autres
                            </span>
                        )}
                    </div>
                    <div className="text-right">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            Total: {numberFormatter.format(total)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
