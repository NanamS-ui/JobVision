// types/SshPathStats.ts

export interface SshPath {
    id?: number;
    keyStorage: string;
    keyType: string;
    sshPort?: string;
    nameKeyPrivate?: string;
    password?: string;
    yamlStorageKey?: string;
    privateKeyContent?:string;
    name?:string;
}

export interface SshPathStats {
    totalKeys: number;
    keyTypeMap: { [key: string]: number };
    uniquePaths: number;
    nodeCountByKeyType: { [key: string]: number };
    sshPaths: SshPath[]; // ✅ Ajout de la liste
}
