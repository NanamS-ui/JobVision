import {NodeDTO} from "./NodeDTO";
import {ExecutionMyDTO} from "./ExecutionMyDTO";

export interface HistoriqueExecutionDTO {
    idHistorique: number;
    execution: ExecutionMyDTO;
    node: NodeDTO;
    stepCtx: string;
    status: string;
    logMessage: string;
    archive: boolean;
    dateExecution: string;
}