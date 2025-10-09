import { JobRef } from "./JobRef";
import { NodeState } from "./ExecutionStateResponse";
import {ErrorHandlerDTO} from "./ErrorHandlerDTO";

export interface WorkflowStepMyDTO {
    stepNumber: number;
    name: string;
    description: string;
    pluginType: string;
    command: string;
    nodeStep: boolean;
    keepgoingOnSuccess: boolean;
    keepgoingOnFailure: string;
    script: string;
    scriptType: string;
    args: string;
    filePath: string;
    interpreter: string;
    jobRef: string;
    jobRefObj?: JobRef;
    errorHandler : ErrorHandlerDTO

    // Nouveaux champs
    executionState?: string;
    nodeStates?: Record<string, NodeState>; // ex: { "node-remote-max": NodeState, "node-remote-toky": NodeState }
}
