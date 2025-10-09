import {ProjectStatsViewDTO} from "./ProjectStatsViewDTO.ts";

export interface ProjectStats {
    totalProjects: number;
    totalExecutions: number;
    successRatePercent: number;
    avgExecutionDurationSec: number;
    projects: ProjectStatsViewDTO[];
}
