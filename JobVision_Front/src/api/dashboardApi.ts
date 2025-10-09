import { DashboardDTO } from "../types/Dashboard.ts";
import { getAuthHeaders } from "./headers.ts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchDashboardByDate(startDate: string, endDate: string): Promise<DashboardDTO> {
    const response = await fetch(
        `${API_BASE_URL}/dashboard/by-date?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
        {
            method: 'GET',
            credentials: 'include',
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(`Erreur API Dashboard: ${response.status} ${response.statusText}`);
    }

    return await response.json() as DashboardDTO;
}

export async function fetchDashboard(timeRange: string = 'lastWeek'): Promise<DashboardDTO> {
    const response = await fetch(`${API_BASE_URL}/dashboard?timeRange=${encodeURIComponent(timeRange)}`, {
        method: 'GET',
        credentials: 'include', // Pour envoyer le cookie
        headers: getAuthHeaders() // Pour inclure Content-Type
    });

    if (!response.ok) {
        throw new Error(`Erreur API Dashboard: ${response.status} ${response.statusText}`);
    }

    return await response.json() as DashboardDTO;
}

export async function fetchDashboardExecution(): Promise<DashboardDTO> {
    const response = await fetch(`${API_BASE_URL}/dashboard/executions`, {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error(`Erreur API Dashboard: ${response.status} ${response.statusText}`);
    }

    return await response.json() as DashboardDTO;
}