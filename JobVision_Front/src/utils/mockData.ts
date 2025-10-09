import { Job, Service, Node, Project, SSHKey, Department, LogEntry } from '../types';

export const departments: Department[] = [
    { id: '1', name: 'Engineering', color: '#10b981', memberCount: 25 },
    { id: '2', name: 'DevOps', color: '#3b82f6', memberCount: 12 },
    { id: '3', name: 'QA', color: '#8b5cf6', memberCount: 15 },
    { id: '4', name: 'Data', color: '#f59e0b', memberCount: 8 },
];

export const mockJobs: Job[] = [
    {
        id: '1',
        name: 'Data Pipeline Processing',
        status: 'running',
        progress: 75,
        department: 'Data',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        logs: [],
        kpis: { successRate: 94.5, avgDuration: 45, errorCount: 2 }
    },
    {
        id: '2',
        name: 'API Deployment',
        status: 'completed',
        progress: 100,
        department: 'DevOps',
        startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
        duration: 60,
        logs: [],
        kpis: { successRate: 98.2, avgDuration: 35, errorCount: 0 }
    },
    {
        id: '3',
        name: 'Test Suite Execution',
        status: 'failed',
        progress: 45,
        department: 'QA',
        startTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
        logs: [],
        kpis: { successRate: 87.3, avgDuration: 28, errorCount: 5 }
    },
    {
        id: '4',
        name: 'Database Migration',
        status: 'pending',
        progress: 0,
        department: 'Engineering',
        startTime: new Date(),
        logs: [],
        kpis: { successRate: 92.1, avgDuration: 120, errorCount: 1 }
    }
];

export const mockServices: Service[] = [
    {
        id: '1',
        name: 'Authentication Service',
        status: 'healthy',
        uptime: 99.9,
        responseTime: 45,
        errorRate: 0.1,
        department: 'Engineering'
    },
    {
        id: '2',
        name: 'Payment Gateway',
        status: 'warning',
        uptime: 98.5,
        responseTime: 120,
        errorRate: 2.3,
        department: 'Engineering'
    },
    {
        id: '3',
        name: 'Data Analytics',
        status: 'healthy',
        uptime: 99.7,
        responseTime: 85,
        errorRate: 0.3,
        department: 'Data'
    },
    {
        id: '4',
        name: 'File Storage',
        status: 'critical',
        uptime: 95.2,
        responseTime: 250,
        errorRate: 5.1,
        department: 'DevOps'
    }
];

export const mockNodes: Node[] = [
    {
        id: '1',
        name: 'prod-worker-01',
        status: 'online',
        cpu: 45,
        memory: 67,
        disk: 23,
        network: 12,
        lastHeartbeat: new Date(Date.now() - 30000)
    },
    {
        id: '2',
        name: 'prod-worker-02',
        status: 'online',
        cpu: 78,
        memory: 54,
        disk: 67,
        network: 25,
        lastHeartbeat: new Date(Date.now() - 15000)
    },
    {
        id: '3',
        name: 'staging-worker-01',
        status: 'maintenance',
        cpu: 0,
        memory: 0,
        disk: 45,
        network: 0,
        lastHeartbeat: new Date(Date.now() - 10 * 60 * 1000)
    },
    {
        id: '4',
        name: 'dev-worker-01',
        status: 'offline',
        cpu: 0,
        memory: 0,
        disk: 89,
        network: 0,
        lastHeartbeat: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
];

export const mockProjects: Project[] = [
    {
        id: '1',
        name: 'Customer Portal Redesign',
        department: 'Engineering',
        status: 'active',
        progress: 65,
        jobs: mockJobs.slice(0, 2),
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
        id: '2',
        name: 'Infrastructure Upgrade',
        department: 'DevOps',
        status: 'active',
        progress: 40,
        jobs: mockJobs.slice(2, 4),
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    }
];

export const mockSSHKeys: SSHKey[] = [
    {
        id: '1',
        name: 'production-deploy-key',
        fingerprint: 'SHA256:nThbg6kXUpJWGl7E1IGOCspRomTxdCARLviKw6E5SY8',
        type: 'rsa',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
        id: '2',
        name: 'staging-access-key',
        fingerprint: 'SHA256:jPfqLBfH3IhZ8oYmwqpOu9FGhLyCCNLpOEQaFJOGxvs',
        type: 'ed25519',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
];

export const mockLogs: LogEntry[] = [
    {
        id: '1',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        level: 'info',
        message: 'Job started successfully',
        jobId: '1'
    },
    {
        id: '2',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        level: 'warning',
        message: 'High memory usage detected',
        jobId: '1'
    },
    {
        id: '3',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        level: 'error',
        message: 'Connection timeout to database',
        jobId: '3'
    }
];

export const generateTimeSeriesData = (days: number = 7) => {
    const data = [];
    for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({
            date: date.toISOString().split('T')[0],
            jobs: Math.floor(Math.random() * 50) + 20,
            success: Math.floor(Math.random() * 45) + 18,
            failed: Math.floor(Math.random() * 5) + 1,
            cpu: Math.floor(Math.random() * 40) + 30,
            memory: Math.floor(Math.random() * 30) + 40,
            responseTime: Math.floor(Math.random() * 100) + 50,
        });
    }
    return data;
};