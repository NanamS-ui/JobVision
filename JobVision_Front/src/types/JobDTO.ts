import {WorkflowMyDTO} from "./WorkflowMyDTO";

export interface JobDTO {
    id: number;
    uuid: string;
    name: string;
    description: string;
    logLevel: string;
    executionEnabled: boolean;
    scheduleEnabled: boolean;
    createdAt: string;  // ISO string
    updatedAt: string;  // ISO string
    nodeFilterId: number;
    nodeFilterText: string;
    projectId: number;
    projectName: string;
    cronExpression: string;
    myWorkflow: WorkflowMyDTO;
    priority : boolean;
}
