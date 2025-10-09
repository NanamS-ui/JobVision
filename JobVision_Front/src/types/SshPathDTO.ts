export interface SshPathDTO {
    id: number;
    keyStorage: string;
    keyType: string;
    sshPort: string;
    nameKeyPrivate: string;
    password: string;
    privateKeyContent: string | null;
    name: string;
}
