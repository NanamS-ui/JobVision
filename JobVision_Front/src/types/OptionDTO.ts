export interface OptionDTO {
    id?: number;
    name: string;
    description?: string;
    required: boolean;
    defaultValue?: string;
    allowedValues?: string;
    multivalued: boolean;
    secure: boolean;
    valueExposed: boolean;
    regex?: string;
    workflowId?: number;
}
