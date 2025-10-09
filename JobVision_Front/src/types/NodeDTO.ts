import { SshPathDTO } from './SshPathDTO';
import { ProjectDTO } from './ProjectDTO';

export interface NodeDTO {
    id: number;
    nodename: string;
    hostname: string;
    username: string;
    osFamily: string | null;
    osName: string | null;
    osArch: string | null;
    tags: string | null;
    description: string | null;
    enabled: boolean;
    createdAt: string | null;
    updatedAt: string | null;

    sshPath: SshPathDTO;
    projects: ProjectDTO[];
}
