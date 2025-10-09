import axios from 'axios';
import { getAuthHeaders } from './headers.ts';  // ← importe ta fonction
import {ProjectStats} from "../types/ProjectStats.ts";
import {ResponseApi, SuccessDetail} from "../types/ResponseApi.ts";
import {ProjectStatsViewDTO} from "../types/ProjectStatsViewDTO.ts";
import {ProjectDTO} from "../types/ProjectDTO.ts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function getProjectStats(): Promise<ProjectStats> {
    const response = await axios.get<ProjectStats>(`${API_BASE_URL}/projects/stats`, {
        headers: getAuthHeaders(),
        withCredentials: true
    });
    console.log("Project stats:", response.data);
    return response.data;
}

export async function createProject(
    projectName: string,
    projectDescription: string,
    idService: number,
    nodeNames?: string[]
): Promise<ResponseApi<null>> {
    const params = new URLSearchParams();
    params.append('projectName', projectName);
    params.append('projectDescription', projectDescription);
    params.append('idService', idService.toString());
    if (nodeNames && nodeNames.length > 0) {
        nodeNames.forEach((n) => params.append('nodeNames', n));
    }

    const response = await axios.post<ResponseApi<null>>(
        `${API_BASE_URL}/projects`,
        params,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            withCredentials: true
        }
    );

    return response.data;
}


export async function deleteProject(name: string): Promise<ResponseApi<null>> {
    const response = await axios.delete<ResponseApi<null>>(`${API_BASE_URL}/projects/${name}`, {
        headers: getAuthHeaders(),
        withCredentials: true
    });
    return response.data;
}

function isSuccess<T>(response: ResponseApi<T>): response is SuccessDetail<T> {
    return (response as SuccessDetail<T>).data !== undefined;
}

export async function autocompleteProjects(query: string): Promise<ProjectStatsViewDTO[]> {
    try {
        const { data: response } = await axios.get<ResponseApi<ProjectStatsViewDTO[]>>(
            `${API_BASE_URL}/projects/autocomplete`,
            {
                params: { query },
                headers: getAuthHeaders(),
                withCredentials: true
            }
        );

        if (isSuccess(response)) {
            return response.data;
        } else {
            console.error('Erreur serveur:', response.message);
            return [];
        }
    } catch (error) {
        console.error('Erreur API autocomplétion:', error);
        return [];
    }
}

export async function fetchAllProjects(): Promise<ProjectDTO[]> {
    try {
        const response = await axios.get<ProjectDTO[]>(`${API_BASE_URL}/projects`, {
            headers: getAuthHeaders(),
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors du chargement des projets :", error);
        throw error;
    }
}

export async function fetchProjectsByService(idService: string): Promise<ProjectDTO[]> {
    // Cette fonction utilise fetch (pas axios), donc tu peux ajouter headers ici aussi
    const response = await fetch(`${API_BASE_URL}/projects/by-service/${encodeURIComponent(idService)}`, {
        headers: getAuthHeaders(),
        credentials: 'include'
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`API error: ${errorMessage}`);
    }

    return await response.json();
}
