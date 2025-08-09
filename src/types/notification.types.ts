// Archivo: src/types/notification.types.ts
import type { Page } from './audit.types'; // Reutilizamos la interfaz genérica de paginación

// Interface para una única notificación, basada en tu documentación
export interface Notification {
    id: number;
    message: string;
    link: string | null;
    isRead: boolean;
    createdAt: string;
}

// La respuesta de la API será una página de notificaciones
export type NotificationPage = Page<Notification>;