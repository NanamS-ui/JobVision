// types/ResponseApi.ts

export interface SuccessDetail<T> {
    status: number;
    message: string;
    timestamp: number;        // epoch millis
    path: string;
    data: T;
}

export interface ErrorDetail {
    status: number;
    message: string;
    timestamp: number;
    path: string;
    error: string;
}

export type ResponseApi<T> = SuccessDetail<T> | ErrorDetail;
