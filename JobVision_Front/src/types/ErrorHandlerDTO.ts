// ErrorHandler.ts

export interface ErrorHandlerDTO {
    id?: number;
    jobId?: number;
    stepId?: number;
    handlerType: string;
    handlerCommand?: string;
    handlerDescription?: string;
    continueOnError?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
