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
    // The backend might return the updated notification, but we just need to know it succeeded
    if (!response.ok) {
        throw new Error('Error al marcar la notificación como leída.');
    }
};

/**
 * Obtiene las notificaciones no leídas.
 * Endpoint: GET /api/notifications/unread
 */
const getUnread = async (): Promise<Notification[]> => {
    const response = await fetch(`${API_BASE_URL}/unread`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) {
        throw new Error('Error al obtener las notificaciones no leídas.');
    }
    return response.json();
};

/**
 * Marca todas las notificaciones como leídas.
 * Endpoint: PUT /api/notifications/read-all
 */
const markAllAsRead = async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/read-all`, {
        method: 'PUT',
        headers: getAuthHeader(),
    });
    if (!response.ok) {
        throw new Error('Error al marcar todas las notificaciones como leídas.');
    }
};

const notificationService = {
    getNotifications,
    getUnreadCount,
    getUnread,
    markAsRead,
    markAllAsRead,
};

export default notificationService;