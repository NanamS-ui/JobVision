import { ServiceDTO, ServiceMonitoringDTO } from '../types/Service.ts';
import { ServiceDetailsDTO } from "../types/ServiceDetailsDTO.ts";
import {getAuthHeaders} from "./headers.ts";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;

// Fonction utilitaire pour récupérer le token actuel

export async function fetchServiceMonitoring(
    serviceName: string = 'all',
    timeRange: string = '1d'
): Promise<ServiceMonitoringDTO> {
    const params = new URLSearchParams({ serviceName, timeRange });

    const response = await fetch(`${BASE_URL}/monitoring/services?${params.toString()}`, {
        headers: getAuthHeaders(),
        credentials: 'include'
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`API error: ${errorMessage}`);
    }

    return await response.json();
}

export const createService = async (name: string, description: string) => {
    const response = await fetch(`${BASE_URL}/services`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ name, description }),
    });

    if (!response.ok) {
        throw new Error('Failed to create service');
    }

    return response.json();
};

export async function fetchAllServices(): Promise<ServiceDTO[]> {
    const response = await fetch(`${BASE_URL}/services`, {
        headers: getAuthHeaders(),
        credentials: 'include'
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`API error: ${errorMessage}`);
    }

    const json: {
        status: number;
        message: string;
        timestamp: number;
        path: string;
        data: ServiceDTO[];
    } = await response.json();

    return json.data;
}

export async function fetchServiceDetails(serviceId: number): Promise<ServiceDetailsDTO> {
    const response = await fetch(`${BASE_URL}/services/${serviceId}/details`, {
        headers: getAuthHeaders(),
        credentials: 'include'
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to fetch service details: ${errorMessage}`);
    }

    return await response.json();
}
