import {DailyExecutionDTO} from "./DailyExecutionDTO";
import {StatusDistributionDTO} from "./StatusDistributionDTO";
import {DailyDurationDTO} from "./DailyDurationDTO";
import {HourlyActivityDTO} from "./HourlyActivityDTO";

export interface StatisticsByJobDTO {
    totalExecutions: number;
    successRate: number;              // en pourcentage
    failureRate: number;              // en pourcentage
    averageDuration: number;          // en secondes ou ms
    lastExecutionDate: string;        // format ISO: "2025-06-30T17:00:00"
    dailyExecutions: DailyExecutionDTO[];
    statusDistribution: StatusDistributionDTO[];
    dailyAverageDuration: DailyDurationDTO[];
    hourlyActivity: HourlyActivityDTO[];
}
