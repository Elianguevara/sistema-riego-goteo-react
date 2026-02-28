// src/components/layout/NotificationBell.tsx

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationService from '../../services/notificationService';
import type { Notification as AppNotification } from '../../types/notification.types';
import { useAuthData } from '../../hooks/useAuthData';
import { resolveNotificationUrl } from '../../utils/notificationNavigation';
import './NotificationBell.css';
import { Bell, Info, AlertTriangle, CheckCircle, CheckCircle2 } from 'lucide-react'; // Importamos más iconos

const timeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " años";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " meses";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " días";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " horas";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutos";
    return "Hace un momento";
};

const NotificationBell = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate(); // Hook para navegación programática
    const authData = useAuthData();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const { data: notificationsData } = useQuery<AppNotification[], Error>({
        queryKey: ['notifications', 'dropdown'],
        queryFn: () => notificationService.getUnread(),
        refetchInterval: 60000,
    });

    const { data: countData } = useQuery<{ unreadCount: number }, Error>({
        queryKey: ['notifications', 'unreadCount'],
        queryFn: notificationService.getUnreadCount,
        refetchInterval: 60000,
    });

    const markAsReadMutation = useMutation({
        mutationFn: notificationService.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: notificationService.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const handleNotificationClick = async (notification: AppNotification) => {
        const targetUrl = resolveNotificationUrl(notification, authData?.role);

        // Cerrar el dropdown inmediatamente para una mejor experiencia de usuario
        setIsOpen(false);

        if (!notification.read) {
            try {
                await markAsReadMutation.mutateAsync(notification.id);
            } catch {
                // Si falla el marcado, igual continuamos con la navegación.
            }
        }

        if (targetUrl) {
            navigate(targetUrl);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const notifications = notificationsData ?? [];
    const unreadCount = countData?.unreadCount ?? 0;

    const getIconForType = (type: string) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle size={16} className="icon-success" />;
            case 'WARNING': return <AlertTriangle size={16} className="icon-warning" />;
            case 'INFO':
            default: return <Info size={16} className="icon-info" />;
        }
    };

    return (
        <div className="notification-bell" ref={menuRef}>
            <button className="bell-trigger" onClick={() => setIsOpen(!isOpen)}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="dropdown-header">
                        <h3>Notificaciones</h3>
                        {notifications.length > 0 && (
                            <button
                                className="mark-all-btn"
                                onClick={() => markAllAsReadMutation.mutate()}
                                disabled={markAllAsReadMutation.isPending}
                            >
                                <CheckCircle2 size={14} />
                                Marcar todas leídas
                            </button>
                        )}
                    </div>
                    <div className="notification-list">
                        {notifications.length > 0 ? (
                            notifications.map((n: AppNotification) => {
                                const canNavigate = Boolean(resolveNotificationUrl(n, authData?.role));

                                return (
                                    <div
                                        key={n.id}
                                        className={`notification-item ${n.read ? 'read' : ''} type-${n.type?.toLowerCase() || 'info'}`}
                                        onClick={() => handleNotificationClick(n)}
                                        style={{ cursor: canNavigate || !n.read ? 'pointer' : 'default' }}
                                    >
                                        <div className="notification-icon">
                                            {getIconForType(n.type)}
                                        </div>
                                        <div className="notification-content">
                                            <p className="notification-message">{n.message}</p>
                                            <span className="notification-time">{timeAgo(n.createdAt)}</span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="empty-notifications">
                                No tienes notificaciones.
                            </div>
                        )}
                    </div>
                    <div className="dropdown-footer">
                        <Link to="/notifications" onClick={() => setIsOpen(false)}>
                            Ver todas las notificaciones
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;

