// types/Service.ts

import {ProjectDTO} from "./ProjectDTO";

export interface ServiceDTO {
    id: number;
    name: string;
    description: string;
    projects: ProjectDTO[];
}

export interface ServiceDailySummaryDTO {
    id: number;
    dateSummary: string; // format ISO ou autre chaîne date
    totalExecutions: number;
    successfulExecutions: number;  // corrigé en number (tu avais string)
    avgResponseTimeMs: number;
    successRatePercent: number;
    errorRatePercent: number;
    status: string;
    serviceId: number;
    serviceName: string;
    serviceDescription: string;
    daysReported: string;
}

export interface ServiceMonitoringDTO {
    successRate: Record<string, number>;
    responseTimeTrends: Record<string, number>;
    serviceDto: ServiceDailySummaryDTO[];
}
