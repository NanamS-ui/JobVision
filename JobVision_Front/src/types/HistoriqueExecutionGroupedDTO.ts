import {NodeExecutionDTO} from "./NodeExecutionDTO";

export interface HistoriqueExecutionGroupedDTO {
    executionId: number;
    dateExecution: string; // ISO datetime string
    dateStarted: string;   // ISO datetime string
    dateEnded: string;     // ISO datetime string
    duration: number;
    status: string;
    over: boolean;
    nodes: NodeExecutionDTO[];
}
