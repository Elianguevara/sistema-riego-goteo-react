// Archivo: src/components/layout/NotificationBell.tsx

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import type { Notification } from '../../types/notification.types';
import './NotificationBell.css';

// Función para dar formato legible a las fechas
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
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const { data: notificationPage } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationService.getNotifications(0, 5),
        refetchInterval: 60000,
    });

    const markAsReadMutation = useMutation({
        mutationFn: notificationService.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markAsReadMutation.mutate(notification.id);
        }
        setIsOpen(false);
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

    const unreadCount = notificationPage?.content?.filter(n => !n.isRead).length ?? 0;
    const notifications = notificationPage?.content ?? [];

    return (
        <div className="notification-bell" ref={menuRef}>
            <button className="bell-trigger" onClick={() => setIsOpen(!isOpen)}>
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="dropdown-header">
                        <h3>Notificaciones</h3>
                    </div>
                    <div className="notification-list">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <Link
                                    to={n.link || '#'}
                                    key={n.id}
                                    className={`notification-item ${n.isRead ? 'read' : ''}`}
                                    onClick={() => handleNotificationClick(n)}
                                >
                                    <p className="notification-message">{n.message}</p>
                                    <span className="notification-time">{timeAgo(n.createdAt)}</span>
                                </Link>
                            ))
                        ) : (
                            <div className="empty-notifications">
                                No tienes notificaciones nuevas.
                            </div>
                        )}
                    </div>
                    {/* Pie de página con enlace a todas las notificaciones */}
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
