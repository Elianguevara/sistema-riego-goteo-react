// Archivo: src/types/notification.types.ts
import type { Page } from './audit.types'; // Reutilizamos la interfaz genérica de paginación

export type NotificationEntityType =
    | 'IRRIGATION'
    | 'TASK'
    | 'HUMEDAD'
    | 'PRECIPITATION'
    | 'FARM'
    | 'REPORT'
    | 'GENERAL';

// Interface para una única notificación, basada en tu documentación
export interface Notification {
    id: number;
    message: string;
    isRead: boolean;
    createdAt: string;
    actionUrl?: string | null;
    entityType?: NotificationEntityType | null;
    entityId?: number | string | null;
    link?: string | null; // Compatibilidad con payloads anteriores
}

// La respuesta de la API será una página de notificaciones
export type NotificationPage = Page<Notification>;
