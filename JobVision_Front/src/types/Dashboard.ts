export interface DailyCount {
    date: string; // ISO string, ex: "2025-07-21"
    count: number;
}

export interface StatusCount {
    status: string;
    count: number;
}

export interface ProjectCount {
    projectName: string;
    count: number;
}

export interface RecentExecution {
    executionId: number;
    status: string;
    dateStarted: string;  // ISO string, ex: "2025-07-21T18:57:52"
    dateEnded: string;
    durationMs: number;
    jobName: string;
    projectName: string;
}

export interface DashboardDTO {
    totalExecutionsToday: number;
    successRateToday: number;
    avgDurationThisMonth: number;
    activeJobs: number;
    executionsByDay: DailyCount[];
    executionStatusToday: StatusCount[];
    statusDistribution: StatusCount[];
    projectDistribution: ProjectCount[];
    recentExecutions: RecentExecution[];
}
