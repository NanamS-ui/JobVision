export interface Job {
    id: string;
    name: string;
    status: 'running' | 'completed' | 'failed' | 'pending';
    progress: number;
    department: string;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    logs: LogEntry[];
    kpis: {
        successRate: number;
        avgDuration: number;
        errorCount: number;
    };
}

export interface LogEntry {
    id: string;
    timestamp: Date;
    level: 'info' | 'warning' | 'error' | 'debug';
    message: string;
    jobId: string;
}

export interface Service {
    id: string;
    name: string;
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    responseTime: number;
    errorRate: number;
    department: string;
}

export interface Node {
    id: string;
    name: string;
    status: 'online' | 'offline' | 'maintenance';
    cpu: number;
    memory: number;
    disk: number;
    network: number;
    lastHeartbeat: Date;
}

export interface Project {
    id: string;
    name: string;
    department: string;
    status: 'active' | 'completed' | 'on-hold';
    progress: number;
    jobs: Job[];
    startDate: Date;
    endDate?: Date;
}

export interface SSHKey {
    id: string;
    name: string;
    fingerprint: string;
    type: 'rsa' | 'ed25519' | 'ecdsa';
    createdAt: Date;
    lastUsed?: Date;
}

export interface Department {
    id: string;
    name: string;
    color: string;
    memberCount: number;
}