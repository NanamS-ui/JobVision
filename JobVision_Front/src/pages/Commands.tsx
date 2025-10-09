import React, {useEffect, useState} from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
    Terminal,
    Play,
    Save,
    FolderOpen,
    Server,
    Clock,
    CheckCircle,
    XCircle,
    Copy,
    Zap,
    Code,
    Monitor,
    Activity
} from 'lucide-react';
import {usePopup} from "../components/pop-up/PopupProviderProps.tsx";
import {ProjectDTO} from "../types/ProjectDTO.ts";
import {fetchAllProjects} from "../api/projectApi.ts";
import {fetchNodesByProjectName} from "../api/nodeApi.ts";
import {NodeDTO} from "../types/NodeDTO.ts";
import {RunCommandDTO} from "../types/RunCommandDTO.ts";
import {runCommand} from "../api/runApi.ts";
import {fetchLogsByExecutionId} from "../api/logApi.ts";
import {LogsOutputDTO} from "../types/LogsOutputDTO.ts";
import {useSearchParams} from "react-router-dom";

interface CommandExecution {
    id: string;
    command: string;
    projectId: string;
    nodeIds: string[];
    status: 'en cours' | 'terminé' | 'échoué' | 'en attente';
    startTime: Date;
    endTime?: Date;
    output: string[];
    exitCode?: number;
}

interface SavedCommand {
    id: string;
    name: string;
    command: string;
    description: string;
    category: string;
    createdAt: Date;
}

export const Commands: React.FC = () => {
    useEffect(() => {
        document.title = "Commands - JobVision";
    }, []);
    const { showPopup } = usePopup();
    const [command, setCommand] = useState<string>('');
    const [executions, setExecutions] = useState<CommandExecution[]>([]);
    const [savedCommands, setSavedCommands] = useState<SavedCommand[]>([
        {
            id: '1',
            name: 'System Status',
            command: 'systemctl status',
            description: 'Check system services status',
            category: 'System',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
            id: '2',
            name: 'Disk Usage',
            command: 'df -h',
            description: 'Display filesystem disk space usage',
            category: 'Monitoring',
            createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000)
        },
        {
            id: '3',
            name: 'Process List',
            command: 'ps aux | head -20',
            description: 'Show running processes',
            category: 'System',
            createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000)
        },
        {
            id: '4',
            name: 'Docker Status',
            command: 'docker ps -a',
            description: 'List all Docker containers',
            category: 'Docker',
            createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000)
        }
    ]);

    const [searchParams] = useSearchParams();
    const [selectedProject, setSelectedProject] = useState<string>('');
    const [projects, setProjects] = useState<ProjectDTO[]>([]);
    const [nodes, setNodes] = useState<NodeDTO[]>([]);
    const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
    const [loadingExecutions, setLoadingExecutions] = useState<Set<string>>(new Set());

    useEffect(() => {
        const projectParam = searchParams.get('project');
        const nodeParam = searchParams.get('node');

        if (projectParam) {
            setSelectedProject(projectParam);
        }
        if (nodeParam) {
            setSelectedNodes([nodeParam]);
        }
    }, [searchParams]);

    useEffect(() => {
        async function loadProjects() {
            try {
                const data = await fetchAllProjects();
                setProjects(data);
            } catch (error) {
                console.error("Erreur lors du chargement des projets :", error);
            }
        }
        loadProjects();
    }, []);

    useEffect(() => {
        async function loadNodes() {
            if (!selectedProject) {
                setNodes([]);
                return;
            }
            try {
                const data = await fetchNodesByProjectName(selectedProject);
                setNodes(data);
            } catch (error) {
                console.error("Erreur lors du chargement des nœuds :", error);
            }
        }
        loadNodes();
    }, [selectedProject]);

    // Commandes prédéfinies par catégorie
    const predefinedCommands = {
        'System': [
            'uptime',
            'free -h',
            'lscpu',
            'uname -a',
            'whoami',
            'pwd'
        ],
        'Monitoring': [
            'top -n 1',
            'htop -n 1',
            'iostat',
            'netstat -tuln',
            'ss -tuln'
        ],
        'Docker': [
            'docker version',
            'docker images',
            'docker ps',
            'docker stats --no-stream',
            'docker system df'
        ],
        'Network': [
            'ping -c 4 google.com',
            'curl -I https://google.com',
            'nslookup google.com',
            'traceroute google.com'
        ]
    };

    const fetchLogsWithRetry = async (executionId: number, retries = 5, delayMs = 10000): Promise<LogsOutputDTO[]> => {
        try {
            const logs = await fetchLogsByExecutionId(executionId);
            if (logs && logs.length > 0) {
                return logs;
            } else if (retries > 0) {
                await new Promise(res => setTimeout(res, delayMs));
                return fetchLogsWithRetry(executionId, retries - 1, delayMs);
            } else {
                return logs;
            }
        } catch (error) {
            if (retries > 0) {
                await new Promise(res => setTimeout(res, delayMs));
                return fetchLogsWithRetry(executionId, retries - 1, delayMs);
            }
            throw error;
        }
    };

    const executeCommand = async () => {
        if (!command.trim() || !selectedProject || selectedNodes.length === 0) {
            showPopup({
                title: 'Paramètres manquants',
                message: 'Veuillez sélectionner un projet, des nœuds et saisir une commande.',
                type: 'warning',
                duration: 3000
            });
            return;
        }

        const dto: RunCommandDTO = {
            projectId: selectedProject,
            command: command.trim(),
            nodeIds: selectedNodes.map(String),
        };

        try {
            const runResult = await runCommand(dto);
            const executionId = runResult.executionId;

            const execution: CommandExecution = {
                id: executionId.toString(),
                command: dto.command,
                projectId: dto.projectId,
                nodeIds: dto.nodeIds,
                status: 'en cours',
                startTime: new Date(),
                output: [`$ ${dto.command}`, 'Exécution lancée sur Rundeck...']
            };

            setExecutions(prev => [execution, ...prev]);

            // **Afficher le loader**
            setLoadingExecutions(prev => new Set(prev).add(execution.id));

            // Récupération des logs avec retry toutes les 10s max 5 fois
            const logs = await fetchLogsWithRetry(executionId);

            // **Cacher le loader**
            setLoadingExecutions(prev => {
                const copy = new Set(prev);
                copy.delete(execution.id);
                return copy;
            });

            const logMessages = logs.map(log => `[${log.logLevel}] ${log.logMessage}`);

            setExecutions(prev => prev.map(exec =>
                exec.id === execution.id
                    ? {
                        ...exec,
                        status: 'terminé',
                        endTime: new Date(),
                        output: [`$ ${dto.command}`, ...logMessages]
                    }
                    : exec
            ));

            setCommand('');
            showPopup({
                title: 'Commande lancée',
                message: `Exécution ID : ${executionId}`,
                type: 'info',
                duration: 2000
            });

        } catch (error) {
            console.error('Erreur lors de l\'exécution de la commande :', error);
            showPopup({
                title: 'Erreur',
                message: 'Impossible de lancer la commande',
                type: 'error',
                duration: 3000
            });
        }
    };


    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showPopup({
            message: 'Copié dans le presse-papiers',
            type: 'success',
            duration: 2000
        });
    };

    const saveCommand = () => {
        if (!command.trim()) return;

        const newCommand: SavedCommand = {
            id: Math.random().toString(36).substr(2, 9),
            name: `Command ${savedCommands.length + 1}`,
            command: command.trim(),
            description: 'Commande personnalisée',
            category: 'Custom',
            createdAt: new Date()
        };

        setSavedCommands(prev => [newCommand, ...prev]);
        showPopup({
            title: 'Commande sauvegardée',
            message: 'La commande a été ajoutée à vos favoris',
            type: 'success',
            duration: 3000
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'en cours':
                return <Activity className="h-4 w-4 text-blue-500 animate-spin" />;
            case 'terminé':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'échoué':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default: // en attente
                return <Clock className="h-4 w-4 text-yellow-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'en cours': return 'info';       // running
            case 'terminé': return 'success';     // completed
            case 'échoué': return 'error';        // failed
            default: return 'warning';            // pending
        }
    };
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Command Center
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Exécutez et gérez des commandes sur vos projets et nœuds
                    </p>
                </div>
            </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Command Input */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                    <Terminal className="h-5 w-5 mr-2 text-primary-600" />
                                    Terminal
                                </h3>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Project and Node Selection */}
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                <FolderOpen className="h-4 w-4 inline mr-1" />
                                                Projet
                                            </label>
                                            <select
                                                value={selectedProject}
                                                onChange={(e) => setSelectedProject(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            >
                                                <option value="">Sélectionner un projet</option>
                                                {projects.map((project) => (
                                                    <option key={project.id} value={project.name}>
                                                        {project.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                <Server className="h-4 w-4 inline mr-1" />
                                                Nœuds
                                            </label>

                                            <div className="space-y-2">
                                                {selectedProject === "" ? (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                        Veuillez choisir un projet d'abord.
                                                    </p>
                                                ) : nodes.length === 0 ? (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                        Aucun nœud disponible pour ce projet.
                                                    </p>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {nodes.map((node) => (
                                                            <label key={node.id} className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    value={node.nodename}
                                                                    checked={selectedNodes.includes(node.nodename)}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setSelectedNodes([...selectedNodes, node.nodename]);
                                                                        } else {
                                                                            setSelectedNodes(selectedNodes.filter((n) => n !== node.nodename));
                                                                        }
                                                                    }}
                                                                    className="h-4 w-4 text-green-600 border-gray-300 rounded"
                                                                />
                                                                <span>
                                                                  {node.nodename} ({node.hostname})
                                                                </span>
                                                            </label>
                                                        ))}

                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <Code className="h-4 w-4 inline mr-1" />
                                            Commande
                                        </label>
                                        <div className="relative">
                                          <textarea
                                              value={command}
                                              onChange={(e) => setCommand(e.target.value)}
                                              placeholder="Tapez votre commande ici... (Entrée pour exécuter, ↑↓ pour l'historique)"
                                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-900 text-green-400 font-mono text-sm resize-none"
                                              rows={3}
                                          />
                                            <div className="absolute bottom-2 right-2 flex space-x-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={saveCommand}
                                                    disabled={!command.trim()}
                                                >
                                                    <Save className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    onClick={executeCommand}
                                                    // disabled={!command.trim() || !selectedProject || !selectedNode}
                                                >
                                                    <Play className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Execution Results */}
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                    <Monitor className="h-5 w-5 mr-2 text-primary-600" />
                                    Résultats d'exécution
                                </h3>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {executions.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>Aucune commande exécutée</p>
                                        </div>
                                    ) : (
                                        executions.map((execution) => {
                                            const project = projects.find(p => p.name === execution.projectId);
                                            const nodesForExecution = nodes.filter(n => execution.nodeIds.includes(String(n.id)));
                                            return (
                                                <div
                                                    key={execution.id}
                                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center space-x-3">
                                                            {getStatusIcon(execution.status)}
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                                    {execution.command}
                                                                </p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {project?.name} → {nodesForExecution.map(n => n.nodename).join(", ")}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Badge variant={getStatusBadge(execution.status) as any}>
                                                                {execution.status}
                                                            </Badge>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => copyToClipboard(execution.output.join('\n'))}
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="bg-gray-900 rounded-md p-3 font-mono text-sm min-h-[100px]">
                                                        {loadingExecutions.has(execution.id) ? (
                                                            <div className="flex items-center justify-center text-gray-400">
                                                                {/* Utilise un spinner/loader que tu as, ou icône animate-spin */}
                                                                <svg
                                                                    className="animate-spin -ml-1 mr-3 h-6 w-6 text-gray-400"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <circle
                                                                        className="opacity-25"
                                                                        cx="12"
                                                                        cy="12"
                                                                        r="10"
                                                                        stroke="currentColor"
                                                                        strokeWidth="4"
                                                                    ></circle>
                                                                    <path
                                                                        className="opacity-75"
                                                                        fill="currentColor"
                                                                        d="M4 12a8 8 0 018-8v8H4z"
                                                                    ></path>
                                                                </svg>
                                                                Chargement des logs...
                                                            </div>
                                                        ) : (
                                                            execution.output.map((line, index) => (
                                                                <div
                                                                    key={index}
                                                                    className={`${
                                                                        line.startsWith('$')
                                                                            ? 'text-green-400'
                                                                            : execution.status === 'échoué' && line.includes('error')
                                                                                ? 'text-red-400'
                                                                                : 'text-gray-300'
                                                                    }`}
                                                                >
                                                                    {line}
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>

                                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                        Démarré: {execution.startTime.toLocaleString()}
                                                        {execution.endTime && (
                                                            <> • Terminé: {execution.endTime.toLocaleString()}</>
                                                        )}
                                                        {execution.exitCode !== undefined && (
                                                            <> • Code de sortie: {execution.exitCode}</>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Commands */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                    <Zap className="h-5 w-5 mr-2 text-primary-600" />
                                    Commandes rapides
                                </h3>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {Object.entries(predefinedCommands).map(([category, commands]) => (
                                        <div key={category}>
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                                {category}
                                            </h4>
                                            <div className="space-y-1">
                                                {commands.map((cmd) => (
                                                    <button
                                                        key={cmd}
                                                        onClick={() => setCommand(cmd)}
                                                        className="w-full text-left px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
                                                    >
                                                        <code className="text-primary-600 dark:text-primary-400">
                                                            {cmd}
                                                        </code>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
        </div>
    );
};