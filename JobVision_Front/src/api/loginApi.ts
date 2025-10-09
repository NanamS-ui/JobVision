import axios from 'axios';
import { LoginResponse } from '../types/LoginResponse';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const loginApi = async (matricule: string, password: string): Promise<LoginResponse> => {
    try {
        const response = await axios.post<LoginResponse>(
            `${API_BASE_URL}/auth/login`,
            { matricule, password },  // corps JSON
            {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true  // important pour cookie HttpOnly
            }
        );
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Erreur lors de la connexion');
        }
        throw new Error('Erreur réseau');
    }
};


export async function logout() {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/logout`,
            null,
            {
                withCredentials: true
            }
        );
        return response.data;
    } catch (error) {
        console.error('Logout failed: ', error);
        throw error;
    }
}
