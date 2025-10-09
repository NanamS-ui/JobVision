import { JobDTO } from "./JobDTO";
import { ExecutionStateResponse } from "./ExecutionStateResponse";

export interface JobDetailDTO {
    job: JobDTO;
    executionState: ExecutionStateResponse;
}
