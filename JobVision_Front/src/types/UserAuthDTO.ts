import {RoleDTO} from "./RoleDTO";
import {ServiceDTO} from "./Service";

export interface UserAuthDTO {
    id: number;
    matricule: string;
    active: boolean;
    name: string;
    lastname: string;
    email: string;
    role?: RoleDTO | null;
    service?: ServiceDTO | null;
}