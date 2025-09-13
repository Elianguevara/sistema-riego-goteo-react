// src/components/layout/NotificationBell.tsx

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import type { Notification, NotificationPage } from '../../types/notification.types';
import './NotificationBell.css';

const timeAgo = (dateString: string): string => {
    // ... (función timeAgo sin cambios)
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

    // --- QUERIES SEPARADAS ---
    // Query para la lista del dropdown (las 5 más recientes)
    const { data: notificationPage } = useQuery<NotificationPage, Error>({
        queryKey: ['notifications', 'dropdown'],
        queryFn: () => notificationService.getNotifications(0, 5),
        refetchInterval: 60000, 
    });

    // Query para el contador de la campana
    const { data: countData } = useQuery<{ unreadCount: number }, Error>({
        queryKey: ['notifications', 'unreadCount'],
        queryFn: notificationService.getUnreadCount,
        refetchInterval: 60000, // También se actualiza cada minuto
    });
    // --- FIN QUERIES ---

    const markAsReadMutation = useMutation({
        mutationFn: notificationService.markAsRead,
        onSuccess: () => {
            // Cuando una notificación se marca como leída, invalidamos TODAS las queries
            // de notificaciones. Esto hará que tanto el contador como la lista se actualicen.
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
        // ... (código para cerrar el dropdown sin cambios)
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const notifications = notificationPage?.content ?? [];
    const unreadCount = countData?.unreadCount ?? 0; // Usamos el dato de la nueva query

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
                                    to={n.link || '#'} // Usamos el link si existe
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