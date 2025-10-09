import { ProjectDTO } from './ProjectDTO.ts';
import { JobDTO } from './JobDTO.ts';

export interface ProjectStatsViewDTO {
    project: ProjectDTO;
    progress: number;
    jobs: JobDTO[];
}
