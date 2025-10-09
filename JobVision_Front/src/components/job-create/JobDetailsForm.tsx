import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { FolderOpen, Info, Settings } from 'lucide-react';
import { ProjectDTO } from "../../types/ProjectDTO.ts";

export interface JobFormData {
    name: string;
    department: string;
    description: string;
    projectId: string;
    timeout: number;
    retries: number;

    uuid: string;
    logLevel: string;
    executionEnabled: boolean;
    scheduleEnabled: boolean;
    priority: boolean;
}

interface JobDetailsFormProps {
    formData: JobFormData;
    departments: { id: number; name: string }[];
    projects: ProjectDTO[];
    onChange: (field: keyof JobFormData, value: any) => void;
}

export const JobDetailsForm: React.FC<JobDetailsFormProps> = ({
                                                                  formData,
                                                                  departments,
                                                                  projects,
                                                                  onChange
                                                              }) => {
    return (
        <div className="space-y-6">
            {/* Informations générales */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <Info className="h-5 w-5 mr-2 text-primary-600" />
                        Informations générales
                    </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nom du job *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => onChange('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="ex. : Job de traitement des données"
                            />
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 space-x-2">
                                <Settings className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                <span>Services *</span>
                            </label>
                            <select
                                value={formData.department}
                                onChange={(e) => onChange('department', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">Sélectionnez un service</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => onChange('description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Description détaillée du job..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <FolderOpen className="h-4 w-4 inline mr-1" />
                            Projet *
                        </label>
                        <select
                            value={formData.projectId}
                            onChange={(e) => onChange('projectId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">Sélectionnez un projet</option>
                            {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Exécution activée */}
                        <div>
                            <label htmlFor="executionEnabled" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Exécution activée
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    id="executionEnabled"
                                    type="checkbox"
                                    checked={formData.executionEnabled}
                                    onChange={(e) => onChange('executionEnabled', e.target.checked)}
                                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {formData.executionEnabled ? 'Activée' : 'Désactivée'}
                                </span>
                            </div>
                        </div>

                        {/* Planification activée */}
                        <div>
                            <label htmlFor="scheduleEnabled" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Planification activée
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    id="scheduleEnabled"
                                    type="checkbox"
                                    checked={formData.scheduleEnabled}
                                    onChange={(e) => onChange('scheduleEnabled', e.target.checked)}
                                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {formData.scheduleEnabled ? 'Activée' : 'Désactivée'}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Priorité
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    id="priority"
                                    type="checkbox"
                                    checked={formData.priority}
                                    onChange={(e) => onChange('priority', e.target.checked)}
                                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {formData.priority}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* UUID (facultatif) */}
                    <div>
                        <label htmlFor="uuid" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            UUID
                        </label>
                        <input
                            id="uuid"
                            type="text"
                            value={formData.uuid}
                            onChange={(e) => onChange('uuid', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="UUID facultatif"
                        />
                    </div>

                    {/* Niveau de log */}
                    <div>
                        <label htmlFor="logLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Niveau de log
                        </label>
                        <select
                            id="logLevel"
                            value={formData.logLevel}
                            onChange={(e) => onChange('logLevel', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">Sélectionnez un niveau de log</option>
                            <option value="INFO">INFO</option>
                            <option value="DEBUG">DEBUG</option>
                            <option value="WARN">WARN</option>
                            <option value="ERROR">ERROR</option>
                        </select>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
