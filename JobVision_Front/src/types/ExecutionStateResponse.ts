import {LogsOutputDTO} from "./LogsOutputDTO";

export interface ExecutionStateResponse {
    executionId: number;
    serverNode: string;
    executionState: string;
    updateTime: string;
    startTime: string;
    endTime: string;
    completed: boolean;
    allNodes: string[];
    stepCount: number;
    steps: Step[];
    nodes: Record<string, NodeStep[]>;
    targetNodes: string[];
    progress: number;
}

export interface Step {
    id: string;
    stepctx: string;
    executionState: string;
    startTime: string;
    updateTime: string;
    endTime: string;
    duration: number;
    nodeStep: boolean;
    nodeStates: Record<string, NodeState>;
}

export interface NodeStep {
    executionState: string;
    stepctx: string;
}



export interface NodeState {
    duration: number;
    executionState: string;
    startTime: string;
    updateTime: string;
    endTime: string;
    progressStatePerNode: number;
    logs?: LogsOutputDTO[];

}
