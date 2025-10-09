export interface JobStatsListDTO {
    idJob: number;
    jobName: string;
    projectName: string;
    serviceName: string;
    lastExecutionId: number | null;
    executionIdRundeck: number | null;
    dateStarted: string | null;        // ISO format (ex: '2025-06-20T12:34:56')
    executionProgress: number;         // 0.0 à 100.0
    durationMs: number | null;
    status: string;
    dateLastSuccess: string | null;    // ISO format de la dernière exécution réussie
    dateLastFailed: string | null;     // ISO format de la dernière exécution échouée
    last5Execution: number | null;
    scheduled: boolean | null;// moyenne des 5 dernières exécutions en ms
}
