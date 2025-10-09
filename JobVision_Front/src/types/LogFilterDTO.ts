export interface LogFilterDTO {
    logLevel?: string | null;
    user?: string | null;
    jobName?: string | null;
    hostname?: string | null;
    startDate?: string | null;  // ou Date ou string selon ce que tu utilises
    endDate?: string | null;
}
