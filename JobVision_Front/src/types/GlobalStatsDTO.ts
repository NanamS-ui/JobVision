import { DailyExecutionDTO } from "./DailyExecutionDTO";
import { DailyDurationDTO } from "./DailyDurationDTO";
import { StatusDistributionDTO } from "./StatusDistributionDTO";
import { ProjectDistributionDTO } from "./ProjectDistributionDTO";

export interface GlobalStatsDTO {
    totalExecutions: number;
    totalSucceeded: number;
    totalFailed: number;
    totalRunning: number;
    averageExecutionTime : number;
    dailyExecutions: DailyExecutionDTO[];
    dailyAverageDurations: DailyDurationDTO[];
    statusDistribution: StatusDistributionDTO[];
    projectDistribution: ProjectDistributionDTO[];
}
