import React from 'react';
import { Timer } from 'lucide-react';
import {Card, CardContent, CardHeader} from "../ui/Card.tsx";

interface ScheduleJobProps {
    schedule: string;
    onScheduleChange: (value: string) => void;
}

const examples = [
    { cron: '0 0 0 * * ? *', desc: 'Tous les jours à minuit' },
    { cron: '0 0 0/6 * * ? *', desc: 'Toutes les 6 heures' },
    { cron: '0 0 0 ? * MON *', desc: 'Tous les lundis à minuit' },
    { cron: '0 0 0 1 * ? *', desc: 'Le premier jour de chaque mois à minuit' },
    { cron: '0 0/15 * * * ? *', desc: 'Toutes les 15 minutes' },
    { cron: '0 0 12 1/1 * ? *', desc: 'Tous les jours à midi' },
    { cron: '0 0 0 ? * SUN *', desc: 'Tous les dimanches à minuit' },
    { cron: '0 15 10 ? * * *', desc: 'À 10h15 tous les jours' },
    { cron: '0 0 2 ? * 2,4,6 *', desc: 'À 2h du matin les mar, jeu et sam' },
    { cron: '0 0 0 25 12 ? *', desc: 'À minuit le 25 décembre (Noël)' }
];

export const ScheduleJob: React.FC<ScheduleJobProps> = ({
                                                            schedule,
                                                            onScheduleChange,
                                                        }) => {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <Timer className="h-5 w-5 mr-2 text-primary-600" />
                        Expression Cron Quartz 7 Champs pour Rundeck
                    </h3>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Saisie expression Cron */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Expression Cron
                        </label>
                        <input
                            type="text"
                            value={schedule}
                            onChange={(e) => onScheduleChange(e.target.value)}
                            placeholder="0 0 0 * * ? (tous les jours à minuit)"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    {/* Exemples et format */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Exemples */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">Exemples courants</h4>
                            <div className="space-y-2">
                                {examples.map((example, index) => (
                                    <button
                                        key={index}
                                        onClick={() => onScheduleChange(example.cron)}
                                        className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <code className="text-sm font-mono text-primary-600 dark:text-primary-400">
                                            {example.cron}
                                        </code>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{example.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Format Cron */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">Format Cron</h4>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-xs text-gray-700 dark:text-gray-300 space-y-2">
                                <p>
                                    Plages : 1-3. Listes : 1,4,6. Incréments : 0/15 (toutes les 15 unités à partir de 0).
                                </p>
                                <p>Valeurs valides du Jour de la semaine : 1-7 ou DIM-SAM</p>
                                <p>Valeurs valides du Mois : 1-12 ou JAN-DEC</p>
                                <p>
                                    Voir :{' '}
                                    <a
                                        href="https://www.quartz-scheduler.net/documentation/quartz-3.x/tutorial/crontriggers.html"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-primary-600 underline"
                                    >
                                        Référence Cron pour aide au formatage
                                    </a>
                                </p>

                                <div className="grid grid-cols-7 gap-2 text-center mt-4">
                                    <div>
                                        <div className="font-mono font-bold text-primary-600">*</div>
                                        <div className="text-gray-600 dark:text-gray-400">Secondes</div>
                                        <div className="text-gray-500 dark:text-gray-500">0-59</div>
                                    </div>
                                    <div>
                                        <div className="font-mono font-bold text-primary-600">*</div>
                                        <div className="text-gray-600 dark:text-gray-400">Minutes</div>
                                        <div className="text-gray-500 dark:text-gray-500">0-59</div>
                                    </div>
                                    <div>
                                        <div className="font-mono font-bold text-primary-600">*</div>
                                        <div className="text-gray-600 dark:text-gray-400">Heures</div>
                                        <div className="text-gray-500 dark:text-gray-500">0-23</div>
                                    </div>
                                    <div>
                                        <div className="font-mono font-bold text-primary-600">*</div>
                                        <div className="text-gray-600 dark:text-gray-400">Jour du mois</div>
                                        <div className="text-gray-500 dark:text-gray-500">1-31</div>
                                    </div>
                                    <div>
                                        <div className="font-mono font-bold text-primary-600">*</div>
                                        <div className="text-gray-600 dark:text-gray-400">Mois</div>
                                        <div className="text-gray-500 dark:text-gray-500">1-12 ou JAN-DEC</div>
                                    </div>
                                    <div>
                                        <div className="font-mono font-bold text-primary-600">*</div>
                                        <div className="text-gray-600 dark:text-gray-400">Jour de la semaine</div>
                                        <div className="text-gray-500 dark:text-gray-500">1-7 ou DIM-SAM</div>
                                    </div>
                                    <div>
                                        <div className="font-mono font-bold text-primary-600">*</div>
                                        <div className="text-gray-600 dark:text-gray-400">Année (optionnel)</div>
                                        <div className="text-gray-500 dark:text-gray-500">1970-2099</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
