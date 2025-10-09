import { ResponseApi } from '../types/ResponseApi.ts';

export function convertTimestampToDate<T>(response: ResponseApi<T>) {
    return {
        ...response,
        timestamp: new Date(response.timestamp),
    };
}

export function formatDate(date: string | null | undefined): string {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
