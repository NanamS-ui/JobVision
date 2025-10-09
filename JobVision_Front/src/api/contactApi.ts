import {
    GroupeContact,
    Contact,
    ContactNotificationPreference,
    NotificationLog,
    ContactPayload,
    GroupeDTO, ContactDTO, ContactNotificationPreferenceDTO, NotificationMyDTO, NotificationLogDetails
} from '../types/Contact';
import axios from "axios";
import { getAuthHeaders } from "./headers.ts";
import { Page } from "../types/Page";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Groupe Contact API
export const fetchGroupeContacts = async (): Promise<GroupeContact[]> => {
    const response = await fetch(`${API_BASE_URL}/groupe-contacts`, {
        headers: getAuthHeaders(),
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch groupe contacts');
    return response.json();
};

export const fetchGroupeContactsNoPreference = async (): Promise<GroupeContact[]> => {
    const response = await fetch(`${API_BASE_URL}/groupe-contacts/no-preference`, {
        headers: getAuthHeaders(),
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch groupe contacts');
    return response.json();
};

export const createGroupeContact = async (
    data: Omit<GroupeContact, 'id' | 'createdAt' | 'updatedAt'>
): Promise<GroupeContact> => {
    const response = await fetch(`${API_BASE_URL}/groupe-contacts`, {
        method: 'POST',
        headers: { ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create groupe contact');
    return response.json();
};

export const updateGroupeContact = async (id: number, data: Partial<GroupeContact>): Promise<GroupeContact> => {
    const response = await fetch(`${API_BASE_URL}/groupe-contacts/${id}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update groupe contact');
    return response.json();
};

export const deleteGroupeContact = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/groupe-contacts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete groupe contact');
};

// Contact API
export const fetchContacts = async (): Promise<ContactPayload[]> => {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
        headers: getAuthHeaders(), credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch contacts');
    return response.json();
};

export const fetchContactsNoPreference = async (): Promise<ContactPayload[]> => {
    const response = await fetch(`${API_BASE_URL}/contacts/no-preference`, {
        headers: getAuthHeaders(),
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch contacts');
    return response.json();
};

export const createContact = async (data: Omit<ContactPayload, 'id'>): Promise<Contact | any> => {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to create contact');

    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        return { message: text }; // si ce n’est pas du JSON
    }
};

export const updateContact = async (id: number, data: Partial<ContactPayload>): Promise<Contact | any> => {
    if (data.groupes) {
        data.groupes = data.groupes.map(g => typeof g === 'string' ? Number(g) : g);
    }

    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to update contact');

    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        return { message: text };
    }
};

export const deleteContact = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete contact');
};

// Notification Preferences API
export const fetchNotificationPreferences = async (): Promise<ContactNotificationPreference[]> => {
    const response = await fetch(`${API_BASE_URL}/notification-preferences`, {
        headers: getAuthHeaders(),
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch notification preferences');
    return response.json();
};

export const createNotificationPreference = async (data: Omit<ContactNotificationPreference, 'id'>): Promise<ContactNotificationPreference> => {
    const response = await fetch(`${API_BASE_URL}/notification-preferences`, {
        method: 'POST',
        headers: { ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create notification preference');
    return response.json();
};

export const updateNotificationPreference = async (id: number, data: Partial<ContactNotificationPreference>): Promise<ContactNotificationPreference> => {
    const response = await fetch(`${API_BASE_URL}/notification-preferences/${id}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update notification preference');
    return response.json();
};

export const deleteNotificationPreference = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/notification-preferences/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete notification preference');
};

export const fetchAvailableGroupesForJob = async (jobId: number): Promise<GroupeDTO[]> => {
    try {
        const response = await axios.get<GroupeDTO[]>(
            `${API_BASE_URL}/notification-preferences/available-groups`,
            { params: { jobId }, headers: getAuthHeaders(), withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Failed to fetch available groups for job', error);
        throw error;
    }
};

/**
 * RÃ©cupÃ¨re les contacts dispos pour crÃ©er une notification sur un job donnÃ©
 */
export const fetchAvailableContactsForJob = async (jobId: number): Promise<ContactDTO[]> => {
    try {
        const response = await axios.get<ContactDTO[]>(
            `${API_BASE_URL}/notification-preferences/available-contacts`,
            { params: { jobId }, headers: getAuthHeaders(), withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Failed to fetch available contacts for job', error);
        throw error;
    }
};

export const fetchNotificationPreference = async (
    idGroupe?: number,
    idContact?: number
): Promise<ContactNotificationPreferenceDTO | null> => {
    if ((idGroupe == null && idContact == null) || (idGroupe != null && idContact != null)) {
        throw new Error('You must provide either idGroupe or idContact, but not both.');
    }

    const params: Record<string, number> = {};
    if (idGroupe != null) params.idGroupe = idGroupe;
    if (idContact != null) params.idContact = idContact;

    try {
        const response = await axios.get<ContactNotificationPreferenceDTO>(
            `${API_BASE_URL}/notification-preferences/preference`,
            { params, headers: getAuthHeaders(), withCredentials: true }
        );
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            return null; // Pas de prÃ©fÃ©rence trouvÃ©e
        }
        throw error;
    }
};

export const fetchNotificationsByJobId = async (jobId: number): Promise<NotificationMyDTO[]> => {
    const response = await fetch(`${API_BASE_URL}/notifications/by-job/${jobId}`, {
        headers: getAuthHeaders(),
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error('Failed to fetch notifications for job ID: ' + jobId);
    }
    return await response.json();
};

export const fetchNotificationPreferenceById = async (id: number): Promise<ContactNotificationPreferenceDTO> => {
    const response = await fetch(`${API_BASE_URL}/notification-preferences/${id}`, {
        headers: getAuthHeaders(),
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch notification preference with id ${id}`);
    }
    return await response.json();
};

export const updateNotificationMy = async (id: number, data: NotificationMyDTO) => {
    const response = await axios.put(`${API_BASE_URL}/notifications/${id}`, data, { headers: getAuthHeaders(), withCredentials: true });
    return response.data;
};

export const saveNotifications = async (notifications: NotificationMyDTO[]): Promise<NotificationMyDTO[]> => {
    const response = await axios.post<NotificationMyDTO[]>(`${API_BASE_URL}/notifications/batch`, notifications, {
        headers: getAuthHeaders(),
        withCredentials: true
    });
    return response.data;
};

export const deleteNotification = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete notification');
};

// Notification History API
export const fetchNotificationHistory = async (): Promise<NotificationLog[]> => {
    const response = await fetch(`${API_BASE_URL}/notification-history`, {
        headers: getAuthHeaders(),
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch notification history');
    return response.json();
};

export const fetchLatestLogs = async (): Promise<NotificationLogDetails[]> => {
    const response = await axios.get<NotificationLogDetails[]>(`${API_BASE_URL}/notification-logs/logs/latest`, {
        headers: getAuthHeaders(),
        withCredentials: true
    });
    return response.data;
};

export interface FilterParams {
    jobId?: number;
    contactId?: number;
    groupeId?: number;
    typeNotification?: string;
    startDate?: string; // ISO string: '2025-07-16T00:00:00'
    endDate?: string;
    page?: number; // zero-based
    size?: number;
}

export const fetchFilteredLogs = async (params: FilterParams): Promise<Page<NotificationLogDetails>> => {
    const { page = 0, size = 10, ...filters } = params ?? {};
    const response = await axios.get<Page<NotificationLogDetails>>(`${API_BASE_URL}/notification-logs/filter`, {
        params: { ...filters, page, size },
        headers: getAuthHeaders(),
        withCredentials: true
    });
    return response.data;
};
