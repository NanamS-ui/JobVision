import {StepLogDTO} from "./StepLogDTO";

export interface NodeExecutionDTO {
    nodeId: number;
    nodeName: string;
    steps: StepLogDTO[];
}

