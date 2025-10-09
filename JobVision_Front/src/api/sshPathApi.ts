import axios from "axios";
import { SshPath, SshPathStats } from "../types/SshPathStats.ts";
import { SshPathDTO } from "../types/SshPathDTO.ts";
import { getAuthHeaders } from "./headers.ts";  // <-- importer ta fonction

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getSshPathStats(): Promise<SshPathStats> {
    const response = await axios.get(`${API_BASE_URL}/sshpath/stats`, {
        headers: getAuthHeaders(),
        withCredentials: true
    });
    return response.data;
}

export async function saveSshPath(sshPath: SshPath): Promise<SshPath> {
    const response = await fetch(`${API_BASE_URL}/sshpath/save`, {
        method: "POST",
        headers: {
            ...getAuthHeaders(), // ajoute tes headers d'auth si nécessaire
        },
        credentials: "include", // pour envoyer les cookies si nécessaire
        body: JSON.stringify(sshPath),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
    }

    return response.json(); // retourne le JSON de la réponse
}

export async function deleteSshPathById(id: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/sshpath/delete/${id}`, {
        headers: getAuthHeaders(),
        withCredentials: true
    });
}

export async function fetchAllSshPaths(): Promise<SshPathDTO[]> {
    try {
        const response = await axios.get<SshPathDTO[]>(`${API_BASE_URL}/sshpath/list`, {
            headers: getAuthHeaders(),
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors du chargement des chemins SSH :", error);
        throw error;
    }
}
