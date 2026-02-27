import type { Notification } from '../types/notification.types';

const ENTITY_TYPE_ROUTES: Record<string, string> = {
    HUMEDAD: '/analyst/irrigation-analysis',
    IRRIGATION: '/operator/irrigation',
    PRECIPITATION: '/analyst/precipitation',
    FARM: '/farms',
    REPORT: '/analyst/reports',
};

export const resolveNotificationUrl = (
    notification: Notification,
    role?: string | null
): string | null => {
    const actionUrl = notification.actionUrl?.trim();
    if (actionUrl && actionUrl !== '#') {
        return actionUrl;
    }

    const legacyLink = notification.link?.trim();
    if (legacyLink && legacyLink !== '#') {
        return legacyLink;
    }

    if (notification.entityType === 'TASK') {
        return role === 'OPERARIO' ? '/tasks' : '/analyst/tasks';
    }

    if (notification.entityType && ENTITY_TYPE_ROUTES[notification.entityType]) {
        return ENTITY_TYPE_ROUTES[notification.entityType];
    }

    return null;
};

