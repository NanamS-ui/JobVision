import React, {useRef, useState, useEffect} from 'react';
import {
    ArrowRight,
    Check,
    ChevronDown,
    Eye,
    FileText,
    GitBranch, List,
    ListOrdered,
    Plus,
    RefreshCw,
    Settings,
    Trash2,
    Upload
} from 'lucide-react';
import {JobFormData, OptionFormData} from "../../pages/JobCreate.tsx";
import {Button} from "../ui/Button.tsx";
import {CodeBlock} from "../ui/CodeBlock.tsx";
import {fetchJobsByProjectAndService} from "../../api/jobApi.ts";
import {JobNameDTOProjectService} from "../../types/JobNameDTO.ts";

interface WorkflowJobProps {
    idJob?: number;
    formData: JobFormData;
    updateField: (field: keyof JobFormData, value: any) => void;
    updateWorkflowStep: (
        stepId: string,
        field: keyof JobFormData['workflowSteps'][number] | 'errorHandler',
        value: any
    ) => void;
    removeWorkflowStep: (stepId: string) => void;
    addWorkflowStep: () => void;
}

export const WorkflowJob: React.FC<WorkflowJobProps> = ({
                                                            idJob,
                                                            formData,
                                                            addWorkflowStep,
                                                            removeWorkflowStep,
                                                            updateWorkflowStep,
                                                            updateField,
                                                        }) => {
    const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
    const [editingScriptStep, setEditingScriptStep] = useState<number | null>(null);
    const [availableJobs, setAvailableJobs] = useState<JobNameDTOProjectService[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(false);

    // Charger les jobs disponibles quand le projet et le service changent
    useEffect(() => {
        const loadAvailableJobs = async () => {
            if (formData.projectId) {
                setLoadingJobs(true);
                try {
                    const jobs = await fetchJobsByProjectAndService(Number(formData.projectId));
                    setAvailableJobs(jobs);
                } catch (error) {
                    console.error('Erreur lors du chargement des jobs:', error);
                    setAvailableJobs([]);
                } finally {
                    setLoadingJobs(false);
                }
            } else {
                setAvailableJobs([]);
            }
        };

        loadAvailableJobs();
    }, [formData.projectId]);

    // Fonction pour gérer la sélection d'un job et remplir automatiquement l'UUID
    const handleJobSelection = (stepNumber: string, selectedJobName: string) => {
        const selectedJob = availableJobs.find(job => job.jobName === selectedJobName);
        if (selectedJob) {
            updateWorkflowStep(stepNumber, "jobRefObj", {
                nameRef: selectedJob.jobName,
                uuid: selectedJob.uuid
            });
        }
    };

    const handleFileUpload = (stepNumber: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;

            // Met à jour step.script avec le contenu du fichier
            updateWorkflowStep(stepNumber.toString(), "script", content);
            updateWorkflowStep(stepNumber.toString(), "filePath", file.name); // Optionnel
        };

        reader.readAsText(file); // 👈 lecture du fichier en texte
    };

    return (
        <div className="space-y-6">
            {/* Workflow Settings Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                    <GitBranch className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Configuration du workflow</h3>
                </div>
                <div className="p-5 space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Strategy Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                <Settings className="h-4 w-4 mr-2 text-gray-500" />
                                Stratégie d'exécution
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.strategy}
                                    onChange={(e) => updateField("strategy", e.target.value)}
                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="node-first">Nœud d'abord</option>
                                    <option value="sequential">Séquentiel</option>
                                    <option value="parallel">Parallèle</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <ChevronDown className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Keepgoing Toggle */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                    <RefreshCw className="h-4 w-4 mr-2 text-gray-500" />
                                    Gestion des échecs
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formData.keepgoing ? 'Continuer en cas d’échec d’une étape' : 'Arrêter au premier échec'}
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.keepgoing}
                                    onChange={(e) => updateField("keepgoing", e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 dark:peer-focus:ring-emerald-600 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>

                        {/* Workflow Description */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                Description du workflow
                            </label>
                            <textarea
                                value={formData.workflowDescription}
                                onChange={(e) => updateField("workflowDescription", e.target.value)}
                                rows={3}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                placeholder="Décrivez l'objectif de ce workflow..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Options Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center">
                        <List className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Options</h3>
                        <span className="ml-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 text-xs px-2.5 py-0.5 rounded-full">
                    {formData.options?.length || 0} options
                </span>
                    </div>
                    {!idJob && (
                        <button
                            onClick={() => {
                                const newOption: OptionFormData = {
                                    name: '',
                                    required: false,
                                    multivalued: false,
                                    secure: false,
                                    valueExposed: false
                                };
                                updateField("options", [...(formData.options || []), newOption]);
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Ajouter une option
                        </button>
                    )}
                </div>

                {idJob ? (
                    // Mode mise à jour : affichage en lecture seule
                    <div className="p-6 space-y-5">
                        {formData.options && formData.options.length > 0 ? (
                            formData.options.map((option, index) => (
                                <div
                                    key={index}
                                    className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:scale-[1.01] transition-transform"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                            Option {index + 1} : {option.name}
                                        </h4>
                                        <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 px-2 py-1 rounded-full">
                                    {option.required ? "Obligatoire" : "Optionnelle"}
                                </span>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
                                        <p><span className="font-semibold">Description :</span> {option.description || "—"}</p>
                                        <p><span className="font-semibold">Valeur par défaut :</span> {option.defaultValue || "—"}</p>
                                        <p><span className="font-semibold">Valeurs autorisées :</span> {option.allowedValues || "—"}</p>
                                        <p><span className="font-semibold">Expression régulière :</span> {option.regex || "—"}</p>
                                        <p><span className="font-semibold">Multivalué :</span> {option.multivalued ? "Oui" : "Non"}</p>
                                        <p><span className="font-semibold">Sécurisé :</span> {option.secure ? "Oui" : "Non"}</p>
                                        <p><span className="font-semibold">Valeur exposée :</span> {option.valueExposed ? "Oui" : "Non"}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-500 dark:text-gray-400 text-center py-8 italic bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                Aucune option disponible pour ce job.
                            </div>
                        )}
                    </div>
                ) : (
                    formData.options?.length ? (
                        <div className="p-5 space-y-4">
                            {formData.options.map((option, index) => (
                                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Option {index + 1}</h4>
                                        <button
                                            onClick={() => {
                                                const updatedOptions = [...formData.options];
                                                updatedOptions.splice(index, 1);
                                                updateField("options", updatedOptions);
                                            }}
                                            className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                            title="Supprimer l’option"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        {/* Name */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Nom*</label>
                                            <input
                                                type="text"
                                                value={option.name}
                                                onChange={(e) => {
                                                    const updatedOptions = [...formData.options];
                                                    updatedOptions[index].name = e.target.value;
                                                    updateField("options", updatedOptions);
                                                }}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            />
                                        </div>

                                        {/* Description */}
                                        {/* Description */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Description</label>
                                            <input
                                                type="text"
                                                value={option.description || ''}
                                                onChange={(e) => {
                                                    const updatedOptions = [...formData.options];
                                                    updatedOptions[index].description = e.target.value;
                                                    updateField("options", updatedOptions);
                                                }}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            />
                                        </div>

                                        {/* Default Value */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Valeur par défaut</label>
                                            <input
                                                type="text"
                                                value={option.defaultValue || ''}
                                                onChange={(e) => {
                                                    const updatedOptions = [...formData.options];
                                                    updatedOptions[index].defaultValue = e.target.value;
                                                    updateField("options", updatedOptions);
                                                }}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            />
                                        </div>

                                        {/* Allowed Values */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Valeurs autorisées (séparées par des virgules)</label>
                                            <input
                                                type="text"
                                                value={option.allowedValues || ''}
                                                onChange={(e) => {
                                                    const updatedOptions = [...formData.options];
                                                    updatedOptions[index].allowedValues = e.target.value;
                                                    updateField("options", updatedOptions);
                                                }}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            />
                                        </div>

                                        {/* Regex */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Expression régulière de validation</label>
                                            <input
                                                type="text"
                                                value={option.regex || ''}
                                                onChange={(e) => {
                                                    const updatedOptions = [...formData.options];
                                                    updatedOptions[index].regex = e.target.value;
                                                    updateField("options", updatedOptions);
                                                }}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            />
                                        </div>

                                        {/* Checkboxes */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={option.required}
                                                    onChange={(e) => {
                                                        const updatedOptions = [...formData.options];
                                                        updatedOptions[index].required = e.target.checked;
                                                        updateField("options", updatedOptions);
                                                    }}
                                                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-600 rounded"
                                                />
                                                <label className="text-sm text-gray-700 dark:text-gray-300">Obligatoire</label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={option.multivalued}
                                                    onChange={(e) => {
                                                        const updatedOptions = [...formData.options];
                                                        updatedOptions[index].multivalued = e.target.checked;
                                                        updateField("options", updatedOptions);
                                                    }}
                                                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-600 rounded"
                                                />
                                                <label className="text-sm text-gray-700 dark:text-gray-300">Multivalué</label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={option.secure}
                                                    onChange={(e) => {
                                                        const updatedOptions = [...formData.options];
                                                        updatedOptions[index].secure = e.target.checked;
                                                        updateField("options", updatedOptions);
                                                    }}
                                                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-600 rounded"
                                                />
                                                <label className="text-sm text-gray-700 dark:text-gray-300">Sécurisé</label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={option.valueExposed}
                                                    onChange={(e) => {
                                                        const updatedOptions = [...formData.options];
                                                        updatedOptions[index].valueExposed = e.target.checked;
                                                        updateField("options", updatedOptions);
                                                    }}
                                                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-600 rounded"
                                                />
                                                <label className="text-sm text-gray-700 dark:text-gray-300">Valeur exposée</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-5 text-center text-gray-500 dark:text-gray-400">
                            Aucune option définie pour l’instant. Cliquez sur « Ajouter une option » pour en créer une.
                        </div>
                    )
                )}
            </div>

            {/* Workflow Steps */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center">
                        <ListOrdered className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Étapes du Workflow</h3>
                        <span className="ml-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 text-xs px-2.5 py-0.5 rounded-full">
                {formData.workflowSteps.length} étapes
            </span>
                    </div>
                    <button
                        onClick={addWorkflowStep}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Ajouter une étape
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    {formData.workflowSteps.map((step, index) => (
                        <div key={step.stepNumber} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 hover:shadow-sm transition-shadow">
                            {/* En-tête de l'étape */}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-300">{index + 1}</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={step.name}
                                        onChange={(e) => updateWorkflowStep(step.stepNumber.toString(), "name", e.target.value)}
                                        placeholder="Nom de l'étape"
                                        className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-emerald-500 focus:outline-none text-gray-900 dark:text-gray-100 w-48"
                                    />
                                </div>
                                <button
                                    onClick={() => removeWorkflowStep(step.id)}
                                    disabled={formData.workflowSteps.length <= 1}
                                    className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Supprimer l'étape"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Contenu de l'étape */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Description</label>
                                    <input
                                        type="text"
                                        placeholder="Description de l'étape"
                                        value={step.description}
                                        onChange={(e) => updateWorkflowStep(step.stepNumber.toString(), "description", e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>

                                {/* Type d'étape */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Type d'étape</label>
                                    <select
                                        value={step.pluginType}
                                        onChange={(e) => updateWorkflowStep(step.stepNumber.toString(), "pluginType", e.target.value)}
                                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="command">Commande</option>
                                        <option value="script">Script</option>
                                        <option value="job-ref">Référence de job</option>
                                    </select>
                                </div>

                                {/* Commande */}
                                {step.pluginType === "command" && (
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Commande</label>
                                        <textarea
                                            rows={2}
                                            placeholder="Entrer la commande"
                                            value={step.command}
                                            onChange={(e) => updateWorkflowStep(step.stepNumber.toString(), "command", e.target.value)}
                                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-black text-green-400 font-mono"
                                        />
                                    </div>
                                )}

                                {/* Script */}
                                {step.pluginType === "script" && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Type de script</label>
                                            <select
                                                value={step.scriptType}
                                                onChange={(e) =>
                                                    updateWorkflowStep(step.stepNumber.toString(), "scriptType", e.target.value)
                                                }
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            >
                                                <option value="">Sélectionner le type...</option>
                                                <option value="sh">Shell (sh)</option>
                                                <option value="bash">Bash</option>
                                                <option value="python">Python</option>
                                                <option value="php">PHP</option>
                                                <option value="perl">Perl</option>
                                                <option value="ruby">Ruby</option>
                                                <option value="node">Node.js</option>
                                                <option value="java">Java</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Arguments</label>
                                            <input
                                                type="text"
                                                placeholder="Arguments du script"
                                                value={step.args}
                                                onChange={(e) => updateWorkflowStep(step.stepNumber.toString(), "args", e.target.value)}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Interpréteur</label>
                                            <input
                                                type="text"
                                                placeholder="Chemin de l'interpréteur"
                                                value={step.interpreter}
                                                onChange={(e) => updateWorkflowStep(step.stepNumber.toString(), "interpreter", e.target.value)}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            />
                                        </div>

                                        {/* Contenu du script */}
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Contenu du script</label>

                                            {editingScriptStep === step.stepNumber ? (
                                                <>
                                        <textarea
                                            rows={6}
                                            value={step.script}
                                            onChange={(e) =>
                                                updateWorkflowStep(step.stepNumber.toString(), "script", e.target.value)
                                            }
                                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-black text-green-400 font-mono"
                                        />
                                                    <div className="flex gap-2 mt-1">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => setEditingScriptStep(null)}
                                                            variant="secondary"
                                                        >
                                                            Fermer
                                                        </Button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="max-h-64 overflow-y-auto rounded-md border border-gray-300 dark:border-gray-600">
                                                        <CodeBlock
                                                            code={step.script || "# Script vide"}
                                                            language={step.scriptType || "bash"}
                                                            className="text-xs"
                                                        />
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="mt-1"
                                                        onClick={() => setEditingScriptStep(step.stepNumber)}
                                                    >
                                                        Modifier le script
                                                    </Button>
                                                </>
                                            )}
                                        </div>

                                        {/* Upload / Chemin du fichier */}
                                        <div className="md:col-span-2 flex items-center gap-3">
                                            <div className="flex-1 space-y-2">
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Chemin du fichier</label>
                                                <input
                                                    type="text"
                                                    placeholder="Chemin vers le fichier script"
                                                    value={step.filePath}
                                                    onChange={(e) =>
                                                        updateWorkflowStep(step.stepNumber.toString(), "filePath", e.target.value)
                                                    }
                                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                />
                                            </div>

                                            <button
                                                onClick={() => fileInputRefs.current[step.stepNumber]?.click()}
                                                className="mt-6 inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                                            >
                                                <Upload className="w-4 h-4 mr-2" />
                                                Téléverser
                                            </button>

                                            <input
                                                type="file"
                                                accept="*/*"
                                                className="hidden"
                                                ref={(el) => (fileInputRefs.current[step.stepNumber] = el)}
                                                onChange={(e) => handleFileUpload(step.stepNumber, e)}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Référence de Job */}
                                {step.pluginType === "job-ref" && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Sélectionner un Job</label>
                                            {loadingJobs ? (
                                                <div className="flex items-center justify-center py-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                                                    <span className="ml-2 text-sm text-gray-500">Chargement des jobs...</span>
                                                </div>
                                            ) : availableJobs.length > 0 ? (
                                                <select
                                                    value={step.jobRefObj?.nameRef || ""}
                                                    onChange={(e) => handleJobSelection(step.stepNumber.toString(), e.target.value)}
                                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                >
                                                    <option value="">-- Sélectionner un job --</option>
                                                    {availableJobs.map((job) => (
                                                        <option key={job.uuid} value={job.jobName}>
                                                            {job.jobName}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
                                                    {formData.projectId
                                                        ? "Aucun job trouvé dans ce projet et service"
                                                        : "Veuillez d'abord sélectionner un projet et un service"
                                                    }
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Nom du Job</label>
                                            <input
                                                type="text"
                                                placeholder="Nom de la référence du job"
                                                value={step.jobRefObj?.nameRef || ""}
                                                onChange={(e) =>
                                                    updateWorkflowStep(step.stepNumber.toString(), "jobRefObj", {
                                                        ...step.jobRefObj,
                                                        nameRef: e.target.value,
                                                    })
                                                }
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">UUID du Job</label>
                                            <input
                                                type="text"
                                                placeholder="UUID de la référence du job"
                                                value={step.jobRefObj?.uuid || ""}
                                                onChange={(e) =>
                                                    updateWorkflowStep(step.stepNumber.toString(), "jobRefObj", {
                                                        ...step.jobRefObj,
                                                        uuid: e.target.value,
                                                    })
                                                }
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Options communes */}
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={step.nodeStep}
                                        onChange={(e) => updateWorkflowStep(step.stepNumber.toString(), "nodeStep", e.target.checked)}
                                        id={`nodeStep-${step.stepNumber}`}
                                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-600 rounded"
                                    />
                                    <label htmlFor={`nodeStep-${step.stepNumber}`} className="text-sm text-gray-700 dark:text-gray-300">
                                        Exécuter comme étape de nœud
                                    </label>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={step.keepgoingOnSuccess}
                                        onChange={(e) => updateWorkflowStep(step.stepNumber.toString(), "keepgoingOnSuccess", e.target.checked)}
                                        id={`keepgoingOnSuccess-${step.stepNumber}`}
                                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-600 rounded"
                                    />
                                    <label htmlFor={`keepgoingOnSuccess-${step.stepNumber}`} className="text-sm text-gray-700 dark:text-gray-300">
                                        Continuer en cas de succès
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Gestionnaire d'erreurs
                                    </label>

                                    {!step.errorHandler ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                updateWorkflowStep(step.stepNumber.toString(), "errorHandler", {
                                                    id: undefined,
                                                    jobId: undefined,
                                                    stepId: undefined,
                                                    handlerType: '', // valeur par défaut
                                                    handlerCommand: '',
                                                    handlerDescription: '',
                                                    continueOnError: false,
                                                });
                                            }}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                                        >
                                            <Plus className="w-4 h-4 mr-1" />
                                            Ajouter une gestion d'erreur
                                        </button>
                                    ) : (
                                        <div className="space-y-2">
                                            <select
                                                value={step.errorHandler.handlerType}
                                                onChange={(e) =>
                                                    updateWorkflowStep(step.stepNumber.toString(), "errorHandler", {
                                                        ...step.errorHandler,
                                                        handlerType: e.target.value,
                                                    })
                                                }
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            >
                                                <option value="">Séléctionner un type</option>
                                                <option value="COMMAND">Commande</option>
                                                <option value="SCRIPT">Script</option>
                                            </select>

                                            <div className="md:col-span-2 space-y-2">
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Commande</label>
                                                <textarea
                                                    rows={2}
                                                    placeholder="Commande ou script du gestionnaire"
                                                    value={step.errorHandler.handlerCommand || ''}
                                                    onChange={(e) =>
                                                        updateWorkflowStep(step.stepNumber.toString(), "errorHandler", {
                                                            ...step.errorHandler,
                                                            handlerCommand: e.target.value,
                                                        })
                                                    }
                                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-black text-green-400 font-mono"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="inline-flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!step.errorHandler.continueOnError}
                                                        onChange={(e) =>
                                                            updateWorkflowStep(step.stepNumber.toString(), "errorHandler", {
                                                                ...step.errorHandler,
                                                                continueOnError: e.target.checked,
                                                            })
                                                        }
                                                        className="form-checkbox text-emerald-600"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        Continuer en cas d'erreur
                                                    </span>
                                                </label>

                                                <div>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateWorkflowStep(step.stepNumber.toString(), "errorHandler", null)
                                                        }
                                                        className="mt-2 inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="w-4 h-4 mr-1"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M6 18L18 6M6 6l12 12"
                                                            />
                                                        </svg>
                                                        Annuler la gestion d'erreur
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Workflow Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Visualisation du Workflow</h3>
                </div>
                <div className="p-5">
                    <div className="flex items-center justify-center overflow-x-auto py-4">
                        <div className="flex items-center space-x-8">
                            {formData.workflowSteps.map((step, index) => (
                                <React.Fragment key={step.stepNumber}>
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-all ${
                                                step.name ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-gray-100 dark:bg-gray-700"
                                            }`}
                                        >
                                            {step.name ? (
                                                <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                            ) : (
                                                <span className="text-sm font-medium text-gray-500">{index + 1}</span>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 max-w-[100px] truncate">
                                            {step.name || `Étape ${index + 1}`}
                                        </p>
                                        {step.pluginType && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">{step.pluginType}</p>
                                        )}
                                    </div>
                                    {index < formData.workflowSteps.length - 1 && (
                                        <div className="relative">
                                            <div className="w-16 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                                            <ArrowRight className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
