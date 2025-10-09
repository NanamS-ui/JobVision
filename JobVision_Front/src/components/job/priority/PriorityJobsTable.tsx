import { useEffect, useState } from "react";
import { JobDTO } from "../../../types/JobDTO";
import { getPriorityJobs } from "../../../api/jobApi";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/Table";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { 
    AlertTriangle, 
    Clock, 
    FileText, 
    Hash, 
    Info, 
    Loader2, 
    RefreshCw, 
    Star,
    TrendingUp
} from "lucide-react";

export const PriorityJobsTable = () => {
    const [jobs, setJobs] = useState<JobDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadJobs = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getPriorityJobs();
            setJobs(data);
        } catch (err: any) {
            console.error("Error loading priority jobs", err);
            setError(err.message || "Erreur lors du chargement des jobs prioritaires");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, []);

    const navigate = useNavigate();

    const getLogLevelColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case 'error':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'warn':
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'info':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'debug':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return "Aujourd'hui";
        } else if (diffDays === 2) {
            return "Hier";
        } else if (diffDays <= 7) {
            return `Il y a ${diffDays - 1} jours`;
        } else {
            return date.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {loading ? "Chargement..." : `${jobs.length} job${jobs.length > 1 ? 's' : ''} prioritaire${jobs.length > 1 ? 's' : ''}`}
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={loadJobs}
                    disabled={loading}
                    className="flex items-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Actualiser</span>
                </Button>
            </CardHeader>
            
            <CardContent className="p-0">
                {error ? (
                    <div className="p-6 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                Erreur de chargement
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                                {error}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={loadJobs}
                                className="mt-2"
                            >
                                Réessayer
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-gray-200 dark:border-gray-700">
                                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <Hash className="h-4 w-4" />
                                            ID
                                        </div>
                                    </TableHead>
                                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Nom
                                        </div>
                                    </TableHead>
                                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4" />
                                            UUID
                                        </div>
                                    </TableHead>
                                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <Info className="h-4 w-4" />
                                            Description
                                        </div>
                                    </TableHead>
                                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            Log Level
                                        </div>
                                    </TableHead>
                                    <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-2 justify-end">
                                            <Clock className="h-4 w-4" />
                                            Créé le
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="px-6 py-8">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Loader2 className="h-8 w-8 animate-spin text-amber-600 dark:text-amber-400" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    Chargement des jobs prioritaires...
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : jobs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="px-6 py-8">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Star className="h-8 w-8 text-gray-400" />
                                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    Aucun job prioritaire
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
                                                    Aucun job prioritaire n'a été trouvé. 
                                                    Les jobs prioritaires apparaîtront ici.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    jobs.map((job) => (
                                        <TableRow
                                            key={job.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800"
                                            onClick={() => navigate(`/jobs/${job.id}`)}
                                        >
                                            <TableCell className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs font-medium">
                                                        #{job.id}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                                    </div>
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                                        {job.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 whitespace-nowrap">
                                                <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300 font-mono">
                                                    {job.uuid}
                                                </code>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 max-w-xs">
                                                <div className="truncate" title={job.description}>
                                                    {job.description || (
                                                        <span className="text-gray-400 dark:text-gray-500 italic">
                                                            Aucune description
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLogLevelColor(job.logLevel)}`}>
                                                    {job.logLevel || 'INFO'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-sm text-gray-900 dark:text-gray-100">
                                                        {formatDate(job.createdAt)}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(job.createdAt).toLocaleTimeString('fr-FR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};