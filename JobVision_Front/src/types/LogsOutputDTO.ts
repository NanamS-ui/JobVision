export interface LogsOutputDTO {
    idLogOutput: number;
    logMessage: string;
    logLevel: string;
    stepCtx: string | null;
    stepNumber: number | null;
    createdAt: string;       // ISO date string
    absoluteTime: string | null;
    localTime: string | null;
    user: string | null;

    // Infos Node associée (simplifiée)
    nodeId: number;
    nodeName: string;

    // Infos ExecutionMy associée (simplifiée)
    executionId: number;
    executionIdRundeck: number | null;
    status: string | null;
}
