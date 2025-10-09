import {WorkflowStepMyDTO} from "./WorkflowStepMyDTO";
import {OptionDTO} from "./OptionDTO";

export interface WorkflowMyDTO {
    strategy: string;
    keepgoing: boolean;
    description: string;
    steps: WorkflowStepMyDTO[];
    options: OptionDTO[];
}