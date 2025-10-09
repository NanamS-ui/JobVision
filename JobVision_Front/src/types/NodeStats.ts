import {NodeDTO} from "./NodeDTO.ts";

export interface NodeStats {
    totalEnabledNodes: number;
    nodesInFilters: number;
    jobsOnActiveNodes: number;
    distinctOsFamilies: number;

    osNodeCountMap: Record<string, number>;
    nodeJobCountMap: Record<string, number>;
    nodes: NodeDTO[];
}