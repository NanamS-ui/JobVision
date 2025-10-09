// ServiceDetailsDTO.ts

import { ProjectDTO } from './ProjectDTO';
import {ServiceDTO} from "./Service";

export interface ServiceDetailsDTO {
    service: ServiceDTO;
    projects: ProjectDTO[];
}
