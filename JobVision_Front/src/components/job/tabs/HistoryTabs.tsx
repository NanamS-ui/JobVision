import React, { useState, useEffect } from 'react';
import {
    Search,
    ChevronDown,
    ChevronUp,
    Eye,
    EyeOff,
    CheckCircle,
    XCircle,
    Clock,
    Server,
    Calendar,
    FolderOpen, Loader2,
} from 'lucide-react';
import {Card, CardContent, CardHeader} from "../../ui/Card.tsx";
import {Select, SelectItem} from "../../ui/Select.tsx";
import {Input} from "../../ui/Input.tsx";
import {Button} from "../../ui/Button.tsx";
import {Label} from "../../ui/Label.tsx";
import {HistoriqueExecutionGroupedDTO} from "../../../types/HistoriqueExecutionGroupedDTO.ts";
import {NodeDTO} from "../../../types/NodeDTO.ts";
import {NodeExecutionDTO} from "../../../types/NodeExecutionDTO.ts";
import { Page } from "../../../types/Page.ts";

interface HistoryTabsProps {
    idJob: string | undefined;
    isActive: boolean;
    fetchHistory: (jobId: number) => Promise<HistoriqueExecutionGroupedDTO[]>;
    fetchNodesAPI: (jobId: number) => Promise<NodeDTO[]>;
    fetchHistorySearch: (
        jobId: number,
        node?: string,
        dateStart?: string,
        dateEnd?: string,
        status?: string,
        page?: number,
        size?: number
    ) => Promise<Page<HistoriqueExecutionGroupedDTO>>;
}

const HistoryTabs: React.FC<HistoryTabsProps> = ({
                                                     idJob,
                                                     isActive,
                                                     fetchHistory,
                                                     fetchNodesAPI,
                                                     fetchHistorySearch,
                                                 }) => {
    const [currentPage, setCurrentPage] = useState(1); // client-side page for non-search
    const [serverPage, setServerPage] = useState(0); // zero-based page for search
    const pageSize = 10;
    const [isSearching, setIsSearching] = useState(false);
    const [nodes, setNodes] = useState<NodeDTO[]>([]);
    const [executions, setHistory] = useState<HistoriqueExecutionGroupedDTO[]>([]);
    const [searchPageData, setSearchPageData] = useState<Page<HistoriqueExecutionGroupedDTO> | null>(null);
    const [showNodeDetails, setShowNodeDetails] = useState(true);
    const [expandedAll, setExpandedAll] = useState(false);
    const [expandedExecutions, setExpandedExecutions] = useState<Record<number, boolean>>({});
    const [selectedNode, setSelectedNode] = useState('');
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nodePageMap, setNodePageMap] = useState<Record<number, number>>({});

    useEffect(() => {
        if (!isActive) return;
        fetchHistory(Number(idJob)).then((data) => {
            setHistory(data);
        });
    }, [idJob, fetchHistory]);

    useEffect(() => {
        if (!isActive) return;
        setLoading(true);
        fetchNodesAPI(Number(idJob))
            .then(setNodes)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [idJob, fetchNodesAPI]);

    const handleSearch = async () => {
        setIsSearching(true);
        setLoading(true);
        setError(null);
        setServerPage(0);

        try {
            const result = await fetchHistorySearch(
                Number(idJob),
                selectedNode || undefined,
                dateStart || undefined,
                dateEnd || undefined,
                selectedStatus || undefined,
                0,
                pageSize
            );
            setSearchPageData(result);
        } catch (error: any) {
            setError(error.message || 'Error while searching');
        } finally {
            setLoading(false);
        }
    };

    // Recharger la page lorsque serverPage change en mode recherche
    useEffect(() => {
        const run = async () => {
            if (!isSearching) return;
            setLoading(true);
            try {
                const result = await fetchHistorySearch(
                    Number(idJob),
                    selectedNode || undefined,
                    dateStart || undefined,
                    dateEnd || undefined,
                    selectedStatus || undefined,
                    serverPage,
                    pageSize
                );
                setSearchPageData(result);
            } catch (error: any) {
                setError(error.message || 'Error while searching');
            } finally {
                setLoading(false);
            }
        };
        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serverPage]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-green-600 dark:text-green-400" />
            <span className="text-green-600 dark:text-green-400 animate-pulse">
    Loading data...
  </span>
        </div>
    );

    if (error) return <div className="text-red-500 p-4">{error}</div>;

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-6">
                <div className="space-y-6">
                    {/* En-tête */}
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Historique des exécutions
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isSearching ? (searchPageData?.totalElements ?? 0) : executions.length}{" "}
                            {isSearching
                                ? "résultat" + ((searchPageData?.totalElements ?? 0) !== 1 ? "s trouvés" : " trouvé")
                                : "exécution récente" + (executions.length !== 1 ? "s" : "")}
                        </p>
                    </div>

                    {/* Filtres */}
                    <div className="space-y-6">
                        {/* Filtres principaux */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            {/* Sélecteur de nœud */}
                            <div className="space-y-2">
                                <Label htmlFor="nodeSelect" className="text-sm font-medium">
                                    Nœud
                                </Label>
                                <Select
                                    value={selectedNode}
                                    onValueChange={setSelectedNode}
                                    id="nodeSelect"
                                >
                                    <SelectItem value="">Tous les nœuds</SelectItem>
                                    {nodes.map((node) => (
                                        <SelectItem key={node.nodename} value={`${node.nodename}`}>
                                            <span className="truncate">{node.nodename}</span>
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>

                            {/* Plage de dates */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Plage de dates</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label htmlFor="dateStart" className="text-xs">
                                            De
                                        </Label>
                                        <Input
                                            id="dateStart"
                                            type="date"
                                            value={dateStart}
                                            onChange={(e) => setDateStart(e.target.value)}
                                            max={dateEnd || undefined}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="dateEnd" className="text-xs">
                                            À
                                        </Label>
                                        <Input
                                            id="dateEnd"
                                            type="date"
                                            value={dateEnd}
                                            onChange={(e) => setDateEnd(e.target.value)}
                                            min={dateStart || undefined}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Filtre de statut */}
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-sm font-medium">
                                    Statut
                                </Label>
                                <Select
                                    value={selectedStatus}
                                    onValueChange={setSelectedStatus}
                                    id="status"
                                >
                                    <SelectItem value="">Tous les statuts</SelectItem>
                                    <SelectItem value="succeeded">
                                <span className="flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                    Réussi
                                </span>
                                    </SelectItem>
                                    <SelectItem value="failed">
                                <span className="flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                                    Échoué
                                </span>
                                    </SelectItem>
                                    <SelectItem value="running">
                                <span className="flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                                    En cours
                                </span>
                                    </SelectItem>
                                </Select>
                            </div>
                        </div>

                        {/* Boutons d’action */}
                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                variant="primary"
                                onClick={handleSearch}
                                disabled={!selectedNode && !dateStart && !dateEnd && !selectedStatus}
                                className="min-w-[120px] shadow-sm"
                            >
                                <Search className="h-4 w-4 mr-2" />
                                Rechercher
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => setExpandedAll((v) => !v)}
                                className="gap-2"
                            >
                                {expandedAll ? (
                                    <>
                                        <ChevronUp className="h-4 w-4" />
                                        Tout réduire
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-4 w-4" />
                                        Tout développer
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => setShowNodeDetails((v) => !v)}
                                className="gap-2"
                            >
                                {showNodeDetails ? (
                                    <>
                                        <EyeOff className="h-4 w-4" />
                                        Masquer les détails
                                    </>
                                ) : (
                                    <>
                                        <Eye className="h-4 w-4" />
                                        Afficher les détails
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Liste des exécutions */}
                    <div className="space-y-4">
                        {/* Contrôles de pagination - Haut */}
                        {isSearching ? (
                            searchPageData && searchPageData.totalElements > pageSize && (
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Affichage de {Math.min((serverPage + 1) * pageSize, searchPageData.totalElements)} sur {searchPageData.totalElements} exécutions
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setServerPage(p => Math.max(p - 1, 0))}
                                            disabled={serverPage === 0}
                                        >
                                            Précédent
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setServerPage(p => p + 1)}
                                            disabled={serverPage + 1 >= (searchPageData?.totalPages ?? 1)}
                                        >
                                            Suivant
                                        </Button>
                                    </div>
                                </div>
                            )
                        ) : (
                            executions.length > pageSize && (
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Affichage de {Math.min(currentPage * pageSize, executions.length)} sur {executions.length} exécutions
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Précédent
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => p + 1)}
                                            disabled={currentPage * pageSize >= executions.length}
                                        >
                                            Suivant
                                        </Button>
                                    </div>
                                </div>
                            )
                        )}

                        {(isSearching ? (searchPageData?.content.length ?? 0) === 0 : executions.length === 0) ? (
                            <div className="text-center py-12">
                                <FolderOpen className="h-10 w-10 mx-auto text-gray-400" />
                                <h4 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                                    Aucune exécution trouvée
                                </h4>
                                <p className="mt-1 text-gray-500 dark:text-gray-400">
                                    Essayez de modifier vos filtres
                                </p>
                            </div>
                        ) : (
                            (isSearching ? (searchPageData?.content ?? []) : executions)
                                .slice(isSearching ? 0 : (currentPage - 1) * pageSize, isSearching ? pageSize : currentPage * pageSize)
                                .map((execution) => {
                                    const nodeCurrentPage = nodePageMap[execution.executionId] || 1;
                                    const nodesPerPage = 5;
                                    const totalNodes = execution.nodes.length;
                                    const totalPages = Math.ceil(totalNodes / nodesPerPage);

                                    const paginatedNodes = execution.nodes.slice(
                                        (nodeCurrentPage - 1) * nodesPerPage,
                                        nodeCurrentPage * nodesPerPage
                                    );

                                    return (
                                        <Card key={execution.executionId} className="overflow-hidden">
                                            <CardHeader
                                                className={`flex items-center justify-between p-4 cursor-pointer ${
                                                    expandedAll || expandedExecutions[execution.executionId]
                                                        ? 'bg-gray-50 dark:bg-gray-800/30'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    setExpandedExecutions((prev) => ({
                                                        ...prev,
                                                        [execution.executionId]: !prev[execution.executionId],
                                                    }))
                                                }
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div
                                                        className={`p-2 rounded-full ${
                                                            execution.status === 'succeeded'
                                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                                : execution.status === 'failed'
                                                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                                                        }`}
                                                    >
                                                        {execution.status === 'succeeded' ? (
                                                            <CheckCircle className="h-5 w-5" />
                                                        ) : execution.status === 'failed' ? (
                                                            <XCircle className="h-5 w-5" />
                                                        ) : (
                                                            <Clock className="h-5 w-5" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                            Exécution #{execution.executionId}
                                                        </h4>
                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1.5" />
                        {new Date(execution.dateExecution).toLocaleString()}
                    </span>
                                                            <span className="text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                                                                {Math.floor(execution.duration / 1000)} secondes
                    </span>
                                                            <span className="text-gray-500 dark:text-gray-400 flex items-center">
                        <Server className="h-3.5 w-3.5 mr-1.5" />
                                                                {execution.nodes.length} nœud(s)
                    </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span
                                                        className={`text-sm font-medium px-3 py-1 rounded-full ${
                                                            execution.status === 'succeeded'
                                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                                : execution.status === 'failed'
                                                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                                                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                                        }`}
                                                    >
                                                        {execution.status === 'succeeded'
                                                            ? 'Réussi'
                                                            : execution.status === 'failed'
                                                                ? 'Échoué'
                                                                : 'En cours'}
                                                    </span>
                                                    <ChevronDown
                                                        className={`h-4 w-4 transition-transform ${
                                                            expandedAll || expandedExecutions[execution.executionId]
                                                                ? 'transform rotate-180'
                                                                : ''
                                                        }`}
                                                    />
                                                </div>
                                            </CardHeader>

                                            {(expandedAll || expandedExecutions[execution.executionId]) && (
                                                <CardContent className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
                                                    {/* Chronologie */}
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                                                                Début
                                                            </Label>
                                                            <p className="text-gray-900 dark:text-gray-100">
                                                                {new Date(execution.dateStarted).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                                                                Fin
                                                            </Label>
                                                            <p className="text-gray-900 dark:text-gray-100">
                                                                {new Date(execution.dateEnded).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                                                                Durée totale
                                                            </Label>
                                                            <p className="text-gray-900 dark:text-gray-100">
                                                                {Math.floor(execution.duration / 1000)} secondes
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Détails des nœuds et étapes */}
                                                    <div className="space-y-4">
                                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                                                            Détails des nœuds
                                                        </Label>
                                                        {paginatedNodes.map((node: NodeExecutionDTO) => (
                                                            <div
                                                                key={`${execution.executionId}-${node.nodeId}`}
                                                                className="border rounded-lg overflow-hidden"
                                                            >
                                                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30">
                                                                    <div className="flex items-center space-x-3">
                                                                        <Server className="h-5 w-5 text-gray-500" />
                                                                        <span className="font-medium">{node.nodeName}</span>
                                                                    </div>
                                                                    {showNodeDetails && (
                                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                                            {node.steps.length} étape(s)
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {showNodeDetails && (
                                                                    <div className="p-2 border-t">
                                                                        <div className="space-y-2">
                                                                            {node.steps.map((step) => (
                                                                                <div
                                                                                    key={`${execution.executionId}-${node.nodeId}-${step.stepCtx}`}
                                                                                    className="border rounded overflow-hidden"
                                                                                >
                                                                                    <div className="flex items-center justify-between p-1 bg-gray-50 dark:bg-gray-800/20">
                                                                                        <div className="flex items-center space-x-1">
                                                                                            <div
                                                                                                className={`p-0.5 rounded-full ${
                                                                                                    step.status === 'succeeded'
                                                                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                                                                        : step.status === 'failed'
                                                                                                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                                                                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                                                                                                }`}
                                                                                            >
                                                                                                {step.status === 'succeeded' ? (
                                                                                                    <CheckCircle className="h-3 w-3" />
                                                                                                ) : step.status === 'failed' ? (
                                                                                                    <XCircle className="h-3 w-3" />
                                                                                                ) : (
                                                                                                    <Clock className="h-3 w-3" />
                                                                                                )}
                                                                                            </div>
                                                                                            <span className="text-xs font-medium">
                                                                                                Étape {step.stepCtx}
                                                                                            </span>
                                                                                        </div>
                                                                                        <span
                                                                                            className={`text-[10px] px-1 py-0.5 rounded ${
                                                                                                step.status === 'succeeded'
                                                                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                                                                    : step.status === 'failed'
                                                                                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                                                                                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                                                                                                                                }`}
                                                                                                                                            >
                                                                                                        {step.status === 'succeeded'
                                                                                                            ? 'Réussi'
                                                                                                            : step.status === 'failed'
                                                                                                                ? 'Échoué'
                                                                                                                : 'En cours'}
                                                                                                    </span>
                                                                                    </div>
                                                                                    {step.logMessage && (
                                                                                        <div className="p-2 bg-black border-t border-gray-800 rounded-b-md">
                                                                                            <div className="max-h-48 overflow-y-auto text-[11px] font-mono text-gray-100 leading-snug space-y-0.5">
                                                                                                {step.logMessage.split('\n').map((line, idx) => {
                                                                                                    let textColor = 'text-gray-100';

                                                                                                    if (/error|failed/i.test(line)) {
                                                                                                        textColor = 'text-red-500';
                                                                                                    } else if (/warn(ing)?/i.test(line)) {
                                                                                                        textColor = 'text-yellow-400';
                                                                                                    }

                                                                                                    return (
                                                                                                        <div key={idx} className={textColor}>
                                                                                                            {line}
                                                                                                        </div>
                                                                                                    );
                                                                                                })}
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}

                                                        {totalPages > 1 && (
                                                            <div className="flex justify-end items-center space-x-3 pt-3">
                                                                <button
                                                                    disabled={nodeCurrentPage === 1}
                                                                    onClick={() =>
                                                                        setNodePageMap((prev) => ({
                                                                            ...prev,
                                                                            [execution.executionId]: nodeCurrentPage - 1,
                                                                        }))
                                                                    }
                                                                    className={`inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium ${
                                                                        currentPage === 1
                                                                            ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                                                                            : 'text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300'
                                                                    }`}
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        className="h-4 w-4 mr-1"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                        strokeWidth={2}
                                                                    >
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                                                    </svg>
                                                                    Précédent
                                                                </button>
                                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                    Page {nodeCurrentPage} sur {totalPages}
                                                                </span>
                                                                <button
                                                                    disabled={nodeCurrentPage === totalPages}
                                                                    onClick={() =>
                                                                        setNodePageMap((prev) => ({
                                                                            ...prev,
                                                                            [execution.executionId]: nodeCurrentPage + 1,
                                                                        }))
                                                                    }
                                                                    className={`inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium ${
                                                                        currentPage === totalPages
                                                                            ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                                                                            : 'text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300'
                                                                    }`}
                                                                >
                                                                    Suivant
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        className="h-4 w-4 ml-1"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                        strokeWidth={2}
                                                                    >
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            )}
                                        </Card>
                                    );
                                    })
                            )}

                            {/* Pagination Controls - Bottom */}
                            {isSearching ? (
                                searchPageData && searchPageData.totalElements > pageSize && (
                                    <div className="flex justify-center items-center gap-4 pt-4">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setServerPage(0)}
                                            disabled={serverPage === 0}
                                        >
                                            Premier
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setServerPage(p => Math.max(p - 1, 0))}
                                            disabled={serverPage === 0}
                                        >
                                            Précédent
                                        </Button>
                                        <span className="text-sm font-medium">
                                            Page {serverPage + 1} sur {searchPageData.totalPages}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setServerPage(p => p + 1)}
                                            disabled={serverPage + 1 >= searchPageData.totalPages}
                                        >
                                            Suivant
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setServerPage(searchPageData.totalPages - 1)}
                                            disabled={serverPage + 1 >= searchPageData.totalPages}
                                        >
                                            Dernier
                                        </Button>
                                    </div>
                                )
                            ) : (
                                executions.length > pageSize && (
                                    <div className="flex justify-center items-center gap-4 pt-4">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setCurrentPage(1)}
                                            disabled={currentPage === 1}
                                        >
                                            Premier
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Précédent
                                        </Button>
                                        <span className="text-sm font-medium">
                                            Page {currentPage} sur {Math.ceil(executions.length / pageSize)}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setCurrentPage(p => p + 1)}
                                            disabled={currentPage >= Math.ceil(executions.length / pageSize)}
                                        >
                                            Suivant
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setCurrentPage(Math.ceil(executions.length / pageSize))}
                                            disabled={currentPage >= Math.ceil(executions.length / pageSize)}
                                        >
                                            Dernier
                                        </Button>
                                    </div>
                                )
                            )}
                    </div>
                    </div>
                </CardContent>
            </Card>
    );
};

export default HistoryTabs;