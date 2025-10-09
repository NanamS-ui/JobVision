import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import React from 'react';

interface MetricChartProps {
    data: any[];
    dataKey: string;
    title: string;
    nameKey?: string;
    color?: string;
    height?: number;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
}

export const MetricChart: React.FC<MetricChartProps> = ({
                                                            data,
                                                            dataKey,
                                                            title,
                                                            nameKey = 'date',
                                                            color = '#10b981',
                                                            height = 320
                                                        }) => {
    const gradientId = `line-gradient-${dataKey.replace(/\s+/g, '-')}`;
    const areaGradientId = `area-gradient-${dataKey.replace(/\s+/g, '-')}`;

    const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 p-4 rounded-2xl shadow-2xl text-sm space-y-2 transition-all duration-300 transform scale-105">
                    <div className="flex items-center justify-between">
                        <p className="text-gray-500 dark:text-gray-400 font-medium">{label}</p>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                    </div>
                    <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-2">
                        <p className="text-gray-900 dark:text-white font-bold text-lg">
                            {payload[0].value}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wide">
                            {title}
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <defs>
                    <linearGradient id={areaGradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={1} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.8} />
                    </linearGradient>
                </defs>

                <CartesianGrid 
                    strokeDasharray="3 3" 
                    strokeOpacity={0.1} 
                    stroke="#E5E7EB"
                    vertical={false}
                />
                
                <XAxis
                    dataKey={nameKey}
                    tick={{ 
                        fontSize: 11, 
                        fill: '#6B7280',
                        fontWeight: 500
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                />
                
                <YAxis
                    tick={{ 
                        fontSize: 11, 
                        fill: '#6B7280',
                        fontWeight: 500
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                />
                
                <Tooltip
                    content={<CustomTooltip />}
                    cursor={{
                        stroke: color,
                        strokeOpacity: 0.2,
                        strokeWidth: 2,
                        strokeDasharray: "5 5"
                    }}
                />
                
                <Area
                    type="monotone"
                    dataKey={dataKey}
                    stroke={`url(#${gradientId})`}
                    fill={`url(#${areaGradientId})`}
                    strokeWidth={3}
                    animationDuration={1200}
                    isAnimationActive
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};
