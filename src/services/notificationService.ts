// Archivo: src/services/notificationService.ts

import authService from './authService';
import type { Notification, NotificationPage } from '../types/notification.types';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/notifications`;

const getAuthHeader = (): Record<string, string> => {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

/**
 * Obtiene las notificaciones paginadas para el usuario logueado.
 * Endpoint: GET /api/notifications
 */
const getNotifications = async (page = 0, size = 10): Promise<NotificationPage> => {
    const response = await fetch(`${API_BASE_URL}?page=${page}&size=${size}&sort=createdAt,desc`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) {
        throw new Error('Error al obtener las notificaciones.');
    }
    return response.json();
};

/**
 * Marca una notificación específica como leída.
 * Endpoint: PUT /api/notifications/{id}/read
 */
const markAsRead = async (notificationId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${notificationId}/read`, {
        method: 'PUT',
        headers: getAuthHeader(),
    });

    // El status 204 No Content no devuelve cuerpo, pero es una respuesta exitosa
    if (response.status !== 204) {
        throw new Error('Error al marcar la notificación como leída.');
    }
};

const notificationService = {
    getNotifications,
    markAsRead,
};

export default notificationService;