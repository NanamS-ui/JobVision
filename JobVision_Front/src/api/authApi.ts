import {UserCreateDTO} from "../types/UserCreateDTO.ts";
import {UserAuthDTO} from "../types/UserAuthDTO.ts";
import {getAuthHeaders} from "./headers.ts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const createUser = async (userData: UserCreateDTO) => {
    const response = await fetch(`${API_BASE_URL}/users/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création de l\'utilisateur');
    }

    return response.json();
};

export const getUserProfile = async (): Promise<UserAuthDTO> => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de récupération du profil utilisateur');
    }

    return await response.json();
};