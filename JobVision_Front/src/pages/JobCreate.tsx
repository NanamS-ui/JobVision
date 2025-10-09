import React, {useEffect, useState} from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {useNavigate, useParams} from 'react-router-dom';
import {
    Save,
    Calendar,
    Server,
    CheckCircle,
    FileText,
    Workflow, Loader2
} from 'lucide-react';
import {usePopup} from "../components/pop-up/PopupProviderProps.tsx";
import {JobDetailsForm} from "../components/job-create/JobDetailsForm.tsx";
import {fetchAllServices} from "../api/serviceApi.ts";
import {fetchProjectsByService} from "../api/projectApi.ts";
import {ServiceDTO} from "../types/Service.ts";
import {ProjectDTO} from "../types/ProjectDTO.ts";
import {ScheduleJob} from "../components/job-create/ScheduleJob.tsx";
import {NodeJob} from "../components/job-create/NodeJob.tsx";
import {WorkflowJob} from "../components/job-create/WorkflowJob.tsx";
import {JobRef} from "../types/JobRef.ts";
import {createJob, getJobById, updateJob} from "../api/jobApi.ts";
import {NodeDTO} from "../types/NodeDTO.ts";
import {ErrorHandlerDTO} from "../types/ErrorHandlerDTO.ts";

// Styles CSS pour masquer la scrollbar
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

export interface OptionFormData {
    id?: number;
    name: string;
    description?: string;
    required: boolean;
    defaultValue?: string;
    allowedValues?: string;
    multivalued: boolean;
    secure: boolean;
    valueExposed: boolean;
    regex?: string;
    workflowId?: number;
}

export interface JobFormData {
    name: string;
    description: string;
    department: string;
    projectId: string;
    nodeId: string[];           // Liste des IDs de nodes sélectionnés
    nodename: string[];         // Liste des noms de nodes sélectionnés
    command: string;            // Commande globale si applicable
    schedule: string;           // Expression cron ou planning
    priority: boolean;          // Job prioritaire ou non
    timeout: number;            // Timeout d'exécution en secondes
    retries: number;            // Nombre de tentatives en cas d'échec
    uuid: string;               // Identifiant unique
    logLevel: string;           // Niveau de log (DEBUG, INFO, etc.)
    executionEnabled: boolean;  // Exécution activée ou non
    scheduleEnabled: boolean;
    cronExpression: string;// Planification activée ou non

    // Configuration du workflow
    strategy: 'node-first' | 'parallel' | 'sequential';  // Stratégie d'exécution
    keepgoing: boolean;               // Continuer en cas d'erreur sur un node
    workflowDescription: string;     // Description du workflow

    workflowSteps: Array<{
        id: string;
        stepNumber: number;
        name: string;
        description: string;
        pluginType: 'command' | 'script' | 'job-ref' | string; // Type de plugin
        command: string;
        nodeStep: boolean;
        keepgoingOnSuccess: boolean;
        keepgoingOnFailure: string;
        script: string;
        scriptType: 'sh' | 'php' | 'java' | string;
        args: string;
        filePath: string;
        interpreter: string;
        jobRef: string;
        errorHandler : ErrorHandlerDTO | null;
        jobRefObj?: JobRef; // Optionnel si utilisé
        condition?: string;
    }>;

    options: OptionFormData[];
}

export const JobCreate: React.FC = () => {
    useEffect(() => {
        document.title = "Création Job - JobVision";
    }, []);
    const navigate = useNavigate();
    const { idJob } = useParams();
    const { showPopup } = usePopup();
    const [departments, setDepartments] = useState<ServiceDTO[]>([]);
    const [projects, setProjects] = useState<ProjectDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'workflow' | 'schedule' | 'nodes'>('details');
    const [formData, setFormData] = useState<JobFormData>({
        name: '',
        description: '',
        department: '',
        projectId: '',
        nodeId: [],             // Liste des node IDs sélectionnés
        nodename: [],           // Liste des noms de nodes sélectionnés
        command: '',
        schedule: '',
        priority: false,
        timeout: 300,
        retries: 3,
        uuid: '',
        logLevel: '',
        executionEnabled: false,
        scheduleEnabled: false,
        cronExpression: '',

        // Workflow général
        strategy: 'node-first',
        keepgoing: false,
        workflowDescription: '',

        // Liste des étapes du workflow
        workflowSteps: [
            {
                id: '1',
                stepNumber: 1,
                name: 'Preparation',
                description: '',
                pluginType: 'command',
                command: 'echo "Starting job..."',
                nodeStep: false,
                keepgoingOnSuccess: false,
                keepgoingOnFailure: '',
                errorHandler: null,
                script: '',
                scriptType: 'sh',
                args: '',
                filePath: '',
                interpreter: '',
                jobRef: '',
                jobRefObj: undefined,
                condition: ''
            },
            {
                id: '2',
                stepNumber: 2,
                name: 'Main Task',
                description: '',
                pluginType: 'command',
                command: '',
                nodeStep: false,
                keepgoingOnSuccess: false,
                keepgoingOnFailure: '',
                errorHandler: null,
                script: '',
                scriptType: 'sh',
                args: '',
                filePath: '',
                interpreter: '',
                jobRef: '',
                jobRefObj: undefined,
                condition: ''
            },
            {
                id: '3',
                stepNumber: 3,
                name: 'Cleanup',
                description: '',
                pluginType: 'command',
                command: 'echo "Job completed"',
                nodeStep: false,
                keepgoingOnSuccess: false,
                keepgoingOnFailure: '',
                errorHandler: null,
                script: '',
                scriptType: 'sh',
                args: '',
                filePath: '',
                interpreter: '',
                jobRef: '',
                jobRefObj: undefined,
                condition: ''
            }
        ],
        options: []
    });

    const tabs = [
        {
            id: 'details',
            label: 'Détails',
            icon: FileText,
            description: 'Informations générales du job'
        },
        {
            id: 'nodes',
            label: 'Nœuds',
            icon: Server,
            description: 'Configuration du serveur'
        },
        {
            id: 'workflow',
            label: 'Workflow',
            icon: Workflow,
            description: 'Étapes et commandes'
        },
        {
            id: 'schedule',
            label: 'Planification',
            icon: Calendar,
            description: 'Programmation et récurrence'
        }
    ];

    function getPriorityVariant(priority: boolean | undefined): 'default' | 'warning' {
        return priority ? 'warning' : 'default';
    }

    useEffect(() => {
        setLoading(true);
        fetchAllServices()
            .then((data) => {
                setDepartments(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message || 'Échec du chargement des services');
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (formData.department) {
            fetchProjectsByService(formData.department)
                .then((projects) => setProjects(projects))
                .catch((error) => {
                    console.error("Échec du chargement des projets :", error);
                    setProjects([]); // Optionally clear on error
                });
        } else {
            setProjects([]); // Clear if no service selected
        }
    }, [formData.department]);

    useEffect(() => {
        if (idJob) {
            getJobById(Number(idJob)).then((jobData) => {
                if (!jobData) return;
                const { jobDTO, nodeDTOList }: { jobDTO: any; nodeDTOList: NodeDTO[] } = jobData;

                setFormData(prev => ({
                    ...prev,
                    name: jobDTO.name,
                    description: jobDTO.description,
                    department: jobDTO.projectName,
                    projectId: jobDTO.projectId?.toString(),
                    nodeId: nodeDTOList.map((n) => n.id.toString()),
                    nodename: nodeDTOList.map((n) => n.nodename),
                    schedule: jobDTO.cronExpression || '',
                    priority: jobDTO.priority,
                    uuid: jobDTO.uuid,
                    logLevel: jobDTO.logLevel,
                    executionEnabled: jobDTO.executionEnabled,
                    scheduleEnabled: jobDTO.scheduleEnabled,
                    strategy: jobDTO.myWorkflow.strategy,
                    keepgoing: jobDTO.myWorkflow.keepgoing,
                    workflowDescription: jobDTO.myWorkflow.description,
                    workflowSteps: jobDTO.myWorkflow.steps.map((step: any, index: number) => ({
                        ...step,
                        id: step.id || `step-${step.stepNumber || index + 1}`
                    })),
                    options: jobDTO.myWorkflow.options || []
                }));
            });
        }
    }, [idJob]);

    const handleInputChange = (field: keyof JobFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const addWorkflowStep = () => {
        const nextStepNumber = formData.workflowSteps.length + 1;
        const newStep = {
            id: `step-${nextStepNumber}`, // id explicite basé sur le numéro
            stepNumber: nextStepNumber,
            name: `Step ${nextStepNumber}`,
            description: '',
            pluginType: 'command',
            command: '',
            nodeStep: false,
            keepgoingOnSuccess: false,
            keepgoingOnFailure: '',
            errorHandler: {
                id: undefined,             // au lieu de null
                jobId: undefined,
                stepId: undefined,
                handlerType: '',
                handlerCommand: '',
                handlerDescription: '',
                continueOnError: false,
            },
            script: '',
            scriptType: 'sh',
            args: '',
            filePath: '',
            interpreter: '',
            jobRef: '',
            jobRefObj: undefined,
            condition: ''
        };

        setFormData(prev => ({
            ...prev,
            workflowSteps: [...prev.workflowSteps, newStep]
        }));
    };

    const removeWorkflowStep = (stepId: string) => {
        setFormData(prev => ({
            ...prev,
            workflowSteps: prev.workflowSteps.filter(step => step.id !== stepId)
        }));
    };

    const updateWorkflowStep = (
        stepId: string,
        field: keyof typeof formData.workflowSteps[number] | 'errorHandler',
        value: string | boolean | ErrorHandlerDTO
    ) => {
        setFormData(prev => ({
            ...prev,
            workflowSteps: prev.workflowSteps.map(step =>
                step.stepNumber.toString() === stepId ? { ...step, [field]: value } : step
            )
        }));
    };

    const validateForm = (): boolean => {
        const required = ['name', 'department', 'projectId', 'nodeId'];
        const missing = required.filter(field => !formData[field as keyof JobFormData]);

        if (missing.length > 0) {
            showPopup({
                title: 'Champs requis manquants',
                message: `Veuillez remplir les champs suivants: ${missing.join(', ')}`,
                type: 'warning',
                duration: 4000
            });
            return false;
        }

        return true;
    };

    function toISOStringWithOffset(date: Date, offsetHours: number): string {
        const localDate = new Date(date.getTime() + offsetHours * 60 * 60 * 1000);
        return localDate.toISOString().replace('Z', '');
    }

    const handleSave = () => {
        if (!validateForm()) return;

        const { nodename } = formData;
        const createdAt = toISOStringWithOffset(new Date(), 3);
        const updatedAt = toISOStringWithOffset(new Date(), 3);
        const jobPayload = {
            job: {
                name: formData.name,
                description: formData.description,
                logLevel: formData.logLevel,
                executionEnabled: formData.executionEnabled,
                scheduleEnabled: formData.scheduleEnabled,
                priority: formData.priority,
                createdAt: createdAt,
                updatedAt: updatedAt,
                cronExpression: formData.schedule,
                project: {
                    id: Number(formData.projectId),
                    name: "", // Remplis si tu l’as
                },
                workflow: {
                    strategy: formData.strategy,
                    keepgoing: formData.keepgoing,
                    description: formData.workflowDescription,
                    options: formData.options,
                    steps: formData.workflowSteps.map((step) => ({
                        stepNumber: step.stepNumber,
                        name: step.name,
                        description: step.description,
                        pluginType: step.pluginType,
                        command: step.command,
                        nodeStep: step.nodeStep,
                        keepgoingOnSuccess: step.keepgoingOnSuccess,
                        keepgoingOnFailure: step.keepgoingOnFailure,
                        errorHandler: step.errorHandler,
                        script: step.script,
                        scriptType: step.scriptType,
                        args: step.args,
                        filePath: step.filePath,
                        interpreter: step.interpreter,
                        jobRef: step.jobRefObj?.uuid,
                        jobRef_: step.jobRefObj,
                    })),
                },
            },
            nodes: Array.isArray(nodename)
                ? nodename.map((name) => ({ nodename: name }))
                : [],
        };

        console.log("Final Job Payload:", JSON.stringify(jobPayload, null, 2));

        setLoading(true);
        console.log(idJob);
        (idJob ? updateJob(jobPayload, Number(idJob)) : createJob(jobPayload))
            .then((res) => {
                console.log("Job saved:", res);
                showPopup({
                    title: "Job enregistré",
                    message: `Le job "${formData.name}" a été enregistré avec succès`,
                    type: "success",
                    duration: 3000,
                });

                setTimeout(() => {
                    setLoading(false);
                    navigate("/jobs/list");
                }, 4000);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
                showPopup({
                    title: "Error",
                    message: `Échec de l'enregistrement du job "${formData.name}".`,
                    type: "error",
                    duration: 3000,
                });
            });
    };

    const getTabProgress = (tabId: string): number => {
        switch (tabId) {
            case 'schedule':
                return formData.schedule.trim() ? 100 : 0;
            case 'nodes':
                return formData.nodeId && formData.nodeId.length > 0 ? 100 : 0;
            default:
                return 0;
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'details':
                return (
                    <JobDetailsForm
                        formData={formData}
                        departments={departments}
                        projects={projects}
                        onChange={handleInputChange}
                    />
                );

            case 'workflow':
                return (
                    <WorkflowJob
                        idJob={idJob ? Number(idJob) : undefined}
                        formData={formData}
                        addWorkflowStep={addWorkflowStep}
                        removeWorkflowStep={removeWorkflowStep}
                        updateWorkflowStep={updateWorkflowStep}
                        updateField={handleInputChange}
                    />
                );

            case 'schedule':
                return (
                    <ScheduleJob
                        schedule={formData.schedule}
                        onScheduleChange={(value) => handleInputChange('schedule', value)}
                    />
                );

            case 'nodes':
                return (
                    <NodeJob formData={formData} onChange={handleInputChange} />
                );

            default:
                return null;
        }
    };

    if (loading) return <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-green-600 dark:text-green-400" />
        <span className="text-green-600 dark:text-green-400 animate-pulse">
    Chargement des données...
  </span>
    </div>
        ;
    if (error) return <p>Error: {error}</p>;
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {idJob ? "Mettre à jour le job" : "Créer un nouveau job"}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {idJob
                            ? "Modifier et mettre à jour votre tâche d'automatisation"
                            : "Configurer et planifier l'exécution d'une nouvelle tâche d'automatisation"}
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    <Button variant="primary" onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        {idJob ? "Mettre à jour" : "Enregistrer"}
                    </Button>
                </div>
            </div>

            {/* Navigation des onglets */}
            <Card>
                <CardContent className="p-0">
                    <style>{scrollbarHideStyles}</style>
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex space-x-2 sm:space-x-4 md:space-x-8 overflow-x-auto scrollbar-hide">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const progress = getTabProgress(tab.id);
                                const isActive = activeTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`group relative flex items-center py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap flex-shrink-0
                                ${isActive
                                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 flex-shrink-0" />

                                        {/* Texte responsive */}
                                        <span className="hidden sm:inline">{tab.label}</span>
                                        <span className="sm:hidden">
                                            {tab.label.length > 8 ? tab.label.slice(0, 8) + '...' : tab.label}
                                        </span>

                                        {/* Indicateur de progression */}
                                        {progress > 0 && (
                                            <div className="ml-1 sm:ml-2 flex items-center flex-shrink-0">
                                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></div>
                                            </div>
                                        )}

                                        {/* Info-bulle responsive */}
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 hidden sm:block">
                                            {tab.description}
                                        </div>

                                        {/* Info-bulle mobile (tooltip en bas) */}
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 sm:hidden">
                                            {tab.description}
                                        </div>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </CardContent>
            </Card>

            {/* Contenu de l'onglet */}
            <div className="min-h-96">
                {renderTabContent()}
            </div>

            {/* Résumé de la configuration */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-primary-600" />
                        Résumé de la configuration
                    </h3>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                        {/* Section Informations */}
                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">Informations</h4>
                            <div className="text-sm space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Nom :</span>
                                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                                {formData.name || 'Non défini'}
                            </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Service :</span>
                                    <span className="text-gray-900 dark:text-gray-100">
                                {formData.department || 'Non défini'}
                            </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Priorité :</span>
                                    {formData.priority && (
                                        <div className="flex items-center gap-1">
                                            <Badge variant={getPriorityVariant(formData.priority)} size="sm">
                                                Priorité
                                            </Badge>
                                            <span className="text-yellow-500" title="Priorité">★</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section Workflow */}
                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">Flux de travail</h4>
                            <div className="text-sm space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Étapes :</span>
                                    <span className="text-gray-900 dark:text-gray-100">
                                {formData.workflowSteps.length}
                            </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Configurées :</span>
                                    <span className="text-gray-900 dark:text-gray-100">
                                {formData.workflowSteps.filter(step => step.command.trim()).length}
                            </span>
                                </div>
                            </div>
                        </div>

                        {/* Section Planification */}
                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">Planification</h4>
                            <div className="text-sm space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Cron :</span>
                                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">
                                        {formData.schedule || 'Manuel'}
                                    </code>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Délai d'expiration :</span>
                                    <span className="text-gray-900 dark:text-gray-100">
                                {formData.timeout}s
                            </span>
                                </div>
                            </div>
                        </div>

                        {/* Section Exécution */}
                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">Exécution</h4>
                            <div className="text-sm space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Nœud :</span>
                                    <span className="text-gray-900 dark:text-gray-100">
                                {formData.nodename && formData.nodename.length > 0
                                    ? formData.nodename.join(', ')
                                    : 'Non défini'}
                            </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Réessais :</span>
                                    <span className="text-gray-900 dark:text-gray-100">
                                {formData.retries}
                            </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </CardContent>
            </Card>
        </div>
    );
};