import axios from "axios";
import { JobStateDTO } from "../types/JobState";
import { JobStatsListDTO } from "../types/jobStatsListDTO.ts";
import { Options } from "autoprefixer";
import { JobDetailDTO } from "../types/JobDetailDTO.ts";
import { HistoriqueExecutionGroupedDTO } from "../types/HistoriqueExecutionGroupedDTO.ts";
import { Page } from "../types/Page.ts";
import { NodeDTO } from "../types/NodeDTO.ts";
import { StatisticsByJobDTO } from "../types/StatisticsByJobDTO.ts";
import { GlobalStatsDTO } from "../types/GlobalStatsDTO.ts";
import { JobDTO } from "../types/JobDTO.ts";
import { JobNameDTO } from "../pages/Logs.tsx";
import { JobNameDTOProjectService } from "../types/JobNameDTO.ts";
import { getAuthHeaders } from "./headers.ts"; // <-- ajout

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getJobCounts(): Promise<JobStateDTO> {
    const response = await axios.get(`${API_BASE_URL}/jobs/stats`, { headers: getAuthHeaders(), withCredentials: true });
    return response.data;
}

export async function getProgressForRunningJobs(executionIds: number[]): Promise<Record<number, number>> {
    const response = await axios.post(`${API_BASE_URL}/executions/progress`, executionIds, { headers: getAuthHeaders(), withCredentials: true });
    return response.data;
}

export async function autocompleteJobs(query: string): Promise<JobStatsListDTO[]> {
    const url = new URL(`${API_BASE_URL}/jobs/autocomplete`);
    url.searchParams.append('query', query);

    const response = await fetch(url.toString(), { headers: getAuthHeaders(), credentials: 'include' });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${errorText}`);
    }
    return await response.json();
}

export async function runJobWithOptions(id: number, options?: Options): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/jobs/${id}/run`, options ?? {}, {
        headers: { ...getAuthHeaders() },
        withCredentials: true
    });
    return response.data;
}

export async function stopJob(executionId: number): Promise<string> {
    const response = await axios.post<string>(`${API_BASE_URL}/jobs/${executionId}/stop`, null, { headers: getAuthHeaders(), withCredentials: true });
    return response.data;
}

export const fetchJobDetail = async (id: number): Promise<JobDetailDTO> => {
    const response = await axios.get<JobDetailDTO>(`${API_BASE_URL}/jobs/${id}/details/response`, { headers: getAuthHeaders(), withCredentials: true });
    return response.data;
};

export const fetchHistory = async (jobId: number): Promise<HistoriqueExecutionGroupedDTO[]> => {
    const response = await fetch(`${API_BASE_URL}/historique/job/${jobId}`, { headers: getAuthHeaders(), credentials: 'include' });
    if (!response.ok) throw new Error(`Erreur lors de la récupération de l'historique: ${response.status}`);
    return await response.json();
};

export async function fetchNodesAPI(idJob: number): Promise<NodeDTO[]> {
    const response = await fetch(`${API_BASE_URL}/jobs/${idJob}/nodes`, { headers: getAuthHeaders(), credentials: 'include' });
    if (!response.ok) throw new Error(`Failed to fetch nodes for job ${idJob}: ${response.statusText}`);
    return response.status === 204 ? [] : await response.json();
}

export const fetchHistorySearch = async (
    idJob: number,
    nodeName?: string,
    dateStart?: string,
    dateEnd?: string,
    status?: string,
    page: number = 0,
    size: number = 10
): Promise<Page<HistoriqueExecutionGroupedDTO>> => {
    const params = new URLSearchParams({ idJob: idJob.toString(), page: String(page), size: String(size) });
    if (nodeName) params.append('nodeName', nodeName);
    if (dateStart) params.append('dateStart', dateStart);
    if (dateEnd) params.append('dateEnd', dateEnd);
    if (status) params.append('status', status);

    const response = await fetch(`${API_BASE_URL}/historique/search?${params.toString()}`, { headers: getAuthHeaders(), credentials: 'include' });
    if (!response.ok) throw new Error(`Erreur lors de la récupération de l'historique: ${response.status}`);
    return await response.json();
};

export const getJobStatistics = async (jobId: number, timeRange: string = '2d', nodeName?: string): Promise<StatisticsByJobDTO> => {
    const response = await axios.get<StatisticsByJobDTO>(`${API_BASE_URL}/jobs/${jobId}/state`, {
        params: { timeRange, nodeName },
        headers: getAuthHeaders(),
        withCredentials: true
    });
    return response.data;
};

export const fetchGlobalStats = async (serviceId: string = "all", timeRange: string = "30d", nodeName?: string): Promise<GlobalStatsDTO> => {
    const response = await axios.get<GlobalStatsDTO>(`${API_BASE_URL}/jobs/stats/global`, {
        params: { serviceId, timeRange, nodeName },
        headers: getAuthHeaders(),
        withCredentials: true
    });
    return response.data;
};

export async function exportJob(jobId: number, format: 'yaml' | 'xml' | 'json' = 'yaml'): Promise<Blob> {
    const url = `${API_BASE_URL}/jobs/${jobId}/export?format=${format}`;
    const response = await fetch(url, { method: 'GET', headers: { ...getAuthHeaders(), Accept: 'application/octet-stream', credentials: 'include' } });
    if (!response.ok) throw new Error(`Failed to export job: ${await response.text()}`);
    return await response.blob();
}

export async function getPriorityJobs(): Promise<JobDTO[]> {
    const response = await axios.get(`${API_BASE_URL}/jobs/priority`, { headers: getAuthHeaders(), withCredentials: true });
    return response.data;
}

export async function fetchGlobalStatsByDate(serviceId: string = "all", dateDebut?: string, dateFin?: string, nodeName?: string): Promise<GlobalStatsDTO> {
    const response = await axios.get<GlobalStatsDTO>(`${API_BASE_URL}/jobs/global/date`, {
        params: { serviceId, dateDebut, dateFin, nodeName },
        headers: getAuthHeaders(),
        withCredentials: true
    });
    return response.data;
}

export async function fetchStatisticsByJobByDate(jobId: number, dateDebut?: string, dateFin?: string, nodeName?: string): Promise<StatisticsByJobDTO> {
    const response = await axios.get<StatisticsByJobDTO>(`${API_BASE_URL}/jobs/state/${jobId}/date`, {
        params: { dateDebut, dateFin, nodeName },
        headers: getAuthHeaders(),
        withCredentials: true
    });
    return response.data;
}

export async function deleteJobById(id: number): Promise<string> {
    const response = await axios.delete(`${API_BASE_URL}/jobs/delete-job/${id}`, { headers: getAuthHeaders(), withCredentials: true });
    return response.data;
}

export async function createJob(jobPayload: any) {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: "POST",
        headers: { ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(jobPayload),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
    return await response.text();
}

export async function getJobById(id: number) {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, { headers: getAuthHeaders(), credentials: 'include' });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return await response.json();
}

export async function updateJob(jobPayload: any, idJob: number) {
    const response = await fetch(`${API_BASE_URL}/jobs/update?idJob=${idJob}`, {
        method: "PUT",
        headers: { ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(jobPayload),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
    return await response.text();
}

export async function fetchJobs(): Promise<JobNameDTO[]> {
    const response = await fetch(`${API_BASE_URL}/jobs/no-deleted/names`, { headers: getAuthHeaders(), credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch jobs');
    return response.json();
}

export async function fetchJobsByProjectAndService(projectId: number): Promise<JobNameDTOProjectService[]> {
    const response = await fetch(`${API_BASE_URL}/jobs/by-project-service?projectId=${projectId}`, {
        headers: getAuthHeaders(),
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch jobs by project and service');
    return response.json();
}

export async function fetchJobByUuid(uuid: string): Promise<JobDTO> {
    const response = await fetch(`${API_BASE_URL}/jobs/uuid/${uuid}`, {
        headers: getAuthHeaders(),
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch job by UUID');
    return response.json();
}
