import {JobDTO} from "./JobDTO";

export interface ProjectDTO {
    id: number;
    version: number;
    dateCreated: string;  // ISO string
    lastUpdated: string;  // ISO string
    name: string;
    description: string;
    state: string;
    jobs: JobDTO[];
}
