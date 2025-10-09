export interface UserCreateDTO {
    matricule: string;
    password: string;
    name: string;
    lastname: string;
    email: string;
    idRole?: number | null;
    idService?: number | null;
}