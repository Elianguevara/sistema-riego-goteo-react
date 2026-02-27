// src/services/notificationService.ts

import authService from './authService';
import type { NotificationPage } from '../types/notification.types';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/notifications`;

// ... (getAuthHeader no cambia)
const getAuthHeader = (): Record<string, string> => {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// ... (getNotifications no cambia)
const getNotifications = async (page = 0, size = 10): Promise<NotificationPage> => {
    const response = await fetch(`${API_BASE_URL}?page=${page}&size=${size}&sort=createdAt,desc`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) {
        throw new Error('Error al obtener las notificaciones.');
    }
    return response.json();
};

// --- FUNCIÓN NUEVA ---
/**
 * Obtiene el conteo total de notificaciones no leídas.
 * Endpoint: GET /api/notifications/unread-count
 */
const getUnreadCount = async (): Promise<{ unreadCount: number }> => {
    const response = await fetch(`${API_BASE_URL}/unread-count`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) {
        throw new Error('Error al obtener el conteo de notificaciones.');
    }
    return response.json();
};

// ... (markAsRead no cambia)
const markAsRead = async (notificationId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${notificationId}/read`, {
        method: 'PUT',
        headers: getAuthHeader(),
    });
    if (response.status !== 204) {
        throw new Error('Error al marcar la notificación como leída.');
    }
};

const notificationService = {
    getNotifications,
    getUnreadCount, // <-- Exportar la nueva función
    markAsRead,
};

export default notificationService;