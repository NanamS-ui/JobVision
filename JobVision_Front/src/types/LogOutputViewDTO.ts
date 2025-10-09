export interface LogOutputViewDTO {
    idLogOutput: number;
    logMessage: string;
    logLevel: string | null;
    stepCtx: string | null;
    stepNumber: number | null;
    createdAt: string;          // ISO string (ex: 2025-07-09T10:23:32.506Z)
    absoluteTime: string | null;
    localTime: string | null;   // HH:mm:ss
    idExecution: number | null;
    user: string | null;
    idNode: number;
    nodename: string;
    hostname: string;
    idJob: number | null;
    jobName: string | null;
    jobDescription: string | null;
}