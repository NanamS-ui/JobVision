import { JobStatsListDTO } from './jobStatsListDTO';

export interface JobStateDTO {
    totalJobs: number;
    runningJobs: number;
    successfulJobs: number;
    failedJobs: number;
    jobStats: JobStatsListDTO[];
}
