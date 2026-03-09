import type { Notification } from '../types/notification.types';

const ENTITY_TYPE_ROUTES: Record<string, string> = {
    HUMEDAD: '/analyst/irrigation-analysis',
    ALERT: '/analyst/irrigation-analysis',
    IRRIGATION: '/operator/irrigation',
    PRECIPITATION: '/analyst/precipitation',
    FARM: '/farms',
    REPORT: '/analyst/reports',
    MAINTENANCE: '/farms',
};

// Rutas válidas del frontend (prefijos aceptados en actionUrl)
const VALID_ROUTE_PREFIXES = [
    '/tasks', '/analyst/', '/operator/', '/farms', '/notifications',
    '/dashboard', '/users', '/audit', '/profile', '/config',
];

const isValidFrontendRoute = (url: string): boolean =>
    VALID_ROUTE_PREFIXES.some(prefix => url.startsWith(prefix));

export const resolveNotificationUrl = (
    notification: Notification,
    role?: string | null
): string | null => {
    const actionUrl = notification.actionUrl?.trim();
    if (actionUrl && actionUrl !== '#' && isValidFrontendRoute(actionUrl)) {
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

