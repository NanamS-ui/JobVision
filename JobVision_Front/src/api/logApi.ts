import { LogCountsResponse } from "../types/LogCountsResponse.ts";
import { LogOutputViewDTO } from "../types/LogOutputViewDTO.ts";
import axios from "axios";
import { LogFilterDTO } from "../types/LogFilterDTO.ts";
import { getAuthHeaders } from "./headers.ts";
import {LogsOutputDTO} from "../types/LogsOutputDTO.ts"; // <-- ajout

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchLogCounts(): Promise<LogCountsResponse> {
    const response = await fetch(`${API_BASE_URL}/logs/counts`, {
        headers: getAuthHeaders(),
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch log counts: ${response.statusText}`);
    }
    const data: LogCountsResponse = await response.json();
    return data;
}

export async function downloadLogsXls(executionId: number): Promise<Blob> {
    const response = await axios.get(`${API_BASE_URL}/logs/${executionId}/export`, {
        headers: getAuthHeaders(),
        withCredentials: true,
        responseType: "blob", // Indique qu'on attend un fichier binaire
    });
    return new Blob([response.data], {
        type: "application/vnd.ms-excel", // Pour .xls ; si .xlsx → "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
}

export const fetchRecentLogs = async (): Promise<LogOutputViewDTO[]> => {
    const response = await axios.get<LogOutputViewDTO[]>(`${API_BASE_URL}/logs/recent`, {
        headers: getAuthHeaders(),
        withCredentials: true
    });
    return response.data;
};

export async function searchLogs(filter: LogFilterDTO): Promise<LogOutputViewDTO[]> {
    const response = await fetch(`${API_BASE_URL}/logs/search`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(filter),
    });
    if (!response.ok) {
        throw new Error('Failed to fetch filtered logs');
    }
    const data: LogOutputViewDTO[] = await response.json();
    return data;
}

export async function exportLogsXls(filter: LogFilterDTO): Promise<Blob> {
    const params = new URLSearchParams();

    if (filter.logLevel) params.append('logLevel', filter.logLevel);
    if (filter.user) params.append('user', filter.user);
    if (filter.jobName) params.append('jobName', filter.jobName);
    if (filter.hostname) params.append('hostname', filter.hostname);

    if (filter.startDate) {
        const startDateStr = typeof filter.startDate === 'string' ? filter.startDate : new Date(filter.startDate).toISOString();
        params.append('startDate', startDateStr);
    }
    if (filter.endDate) {
        const endDateStr = typeof filter.endDate === 'string' ? filter.endDate : new Date(filter.endDate).toISOString();
        params.append('endDate', endDateStr);
    }

    const response = await axios.get(`${API_BASE_URL}/logs/export-filter?${params.toString()}`, {
        headers: getAuthHeaders(),
        responseType: 'blob',
        withCredentials: true
    });

    return response.data;
}

export const fetchLogsByExecutionId = async (executionId: number): Promise<LogsOutputDTO[]> => {
    const response = await fetch(`${API_BASE_URL}/logs/output/${executionId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des logs pour l'exécution ${executionId}`);
    }

    return await response.json();
};