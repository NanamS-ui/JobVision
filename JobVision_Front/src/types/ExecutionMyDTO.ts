import {JobDTO} from "./JobDTO";

export interface ExecutionMyDTO {
    idExecution: number;
    executionIdRundeck: number;
    status: string;
    description: string;
    dateStarted: string;
    dateEnded: string;
    arg: string;
    createdAt: string;
    durationMs: number;
    username: string;
    projectId: number;
    projectName: string;
    job: JobDTO;
}
