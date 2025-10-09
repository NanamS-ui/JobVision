export interface GroupeDTO {
    id: number;
    nameGroupe: string;
    description: string;
}
export interface GroupeContact {
    id: number;
    nameGroupe: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    contactNotificationPreference?: string;
}
export interface ContactDTO {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    groupeContact: GroupeDTO | null;
}
export interface Contact {
    id: number;
    nom?: string;
    prenom?: string;
    email?: string;
    telephone?: string;
    createdAt: string;
    updatedAt: string;
    contactNotificationPreference?: string;
}

export interface ContactPayload {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    groupes: number[];         // Liste des ID des groupes
    nomsGroupes?: string[];
    createAt?: string;
    updateAt?: string;// Liste des noms des groupes (optionnelle)
}

export interface ContactGroupe {
    id: number;
    contact: Contact;
    groupe: GroupeContact;
}

export interface ContactGroupePayload {
    contactId: number;
    groupeId: number;
}

export interface ContactNotificationPreference {
    id: number;
    notifyOnFailed: boolean;
    notifyOnRecovery: boolean;
    notifyOnSuccess: boolean;
    notifyOnStart: boolean;
    channelEmail: boolean;
    channelSms: boolean;
    id_group_contact?: number;
    id_contact?: number;
    groupe?: Partial<GroupeContact>;
    contact?: Partial<Contact>;
}

export interface NotificationLog {
    id_log_notification: number;
    status_job?: string;
    message?: string;
    channel?: string;
    sent_at?: string;
    id_group_contact?: number;
    id_contact?: number;
    id_job?: number;
    groupe_contact?: GroupeContact;
    contact?: Contact;
}

export interface ContactNotificationPreferenceDTO {
    id: number | null;
    notifyOnFailed: boolean;
    notifyOnRecovery: boolean;
    notifyOnSuccess: boolean;
    notifyOnStart: boolean;
    channelEmail: boolean;
    channelSms: boolean;
    id_group_contact: number | null;  // nullable
    id_contact: number | null;        // nullable
    contact?: ContactDTO | null;
    groupe?: GroupeDTO | null;
}

export interface NotificationMyDTO {
    id: number;
    isEnabled: boolean;
    attachLog: boolean;
    contactNotificationPreferenceId: number | null;  // <-- on accepte null
    createdAt: string;
    updatedAt: string;
    jobId: number;
}

export interface NotificationLogDetails {
    idLogNotification: number;
    statusJob: string | null;
    message: string | null;
    channel: string | null;
    sentAt: string | null; // ISO datetime string
    isSent: boolean;
    typeNotification: string | null;
    idExecution: number | null;
    idJob: number | null;
    jobName: string | null;
    contactNom: string | null;
    groupeName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
}
