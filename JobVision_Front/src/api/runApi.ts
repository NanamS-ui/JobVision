import { RunCommandDTO } from "../types/RunCommandDTO.ts";
import {getAuthHeaders} from "./headers.ts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const runCommand = async (dto: RunCommandDTO) => {
    const response = await fetch(`${API_BASE_URL}/runs/execute`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(dto),
    });
    if (!response.ok) throw new Error('Erreur lors du lancement de la commande');
    return await response.json();
};