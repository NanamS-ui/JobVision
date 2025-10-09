import axios from 'axios';
import { OptionDTO } from '../types/OptionDTO'; // ajuste le chemin si besoin
import { getAuthHeaders } from './headers.ts';  // importe ta fonction getAuthHeaders

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function fetchOptionsByJobId(jobId: number): Promise<OptionDTO[]> {
    const response = await axios.get<OptionDTO[]>(`${API_BASE_URL}/options/job/${jobId}`, {
        headers: getAuthHeaders(),
        withCredentials: true
    });
    return response.data;
}
