import axios from "axios";
import { NodeStats } from "../types/NodeStats.ts";
import { NodeDTO } from "../types/NodeDTO.ts";
import { NodeNameDTO } from "../pages/Logs.tsx";
import { getAuthHeaders } from "./headers.ts"; // <-- Ajout

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function fetchNodeStats(): Promise<NodeStats> {
    try {
        const response = await axios.get<NodeStats>(`${API_BASE_URL}/nodes/stats`, {
            headers: getAuthHeaders(),
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching node stats:", error);
        throw error;
    }
}

export async function autocompleteNodename(query: string): Promise<NodeDTO[]> {
    try {
        const response = await axios.get<NodeDTO[]>(`${API_BASE_URL}/nodes/autocomplete`, {
            params: { query },
            headers: getAuthHeaders(),
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching autocomplete results:", error);
        throw error;
    }
}

export async function createNode(node: NodeDTO): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/nodes`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(node),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur lors de la création du node : ${errorText}`);
    }
}

export async function updateNode(node: NodeDTO): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/nodes/update-yaml`, {
            method: "PUT",
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify(node),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur lors de la mise à jour du node : ${errorText}`);
        }
        console.log(response)
    } catch (error) {
        console.error("Erreur API updateNode:", error);
        throw error;
    }
}

export async function deleteNode(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/nodes/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: 'include'
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur lors de la suppression du node: ${errorText}`);
    }
}

export async function fetchNodesByProject(projectId: number): Promise<NodeDTO[]> {
    try {
        const response = await axios.get<NodeDTO[]>(`${API_BASE_URL}/nodes/project`, {
            params: { id_project: projectId },
            headers: getAuthHeaders(),
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching nodes by project:", error);
        throw error;
    }
}

export async function fetchNodesByProjectName(projectId: string): Promise<NodeDTO[]> {
    try {
        const response = await axios.get<NodeDTO[]>(`${API_BASE_URL}/nodes/project-name`, {
            params: { project_name: projectId },
            headers: getAuthHeaders(),
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching nodes by project:", error);
        throw error;
    }
}


export async function fetchNodes(): Promise<NodeNameDTO[]> {
    const response = await fetch(`${API_BASE_URL}/nodes/names`, {
        headers: getAuthHeaders(),
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error('Failed to fetch nodes');
    }
    return response.json();
}
