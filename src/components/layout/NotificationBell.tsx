// Archivo: src/components/layout/NotificationBell.tsx

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import type { Notification, NotificationPage } from '../../types/notification.types';
import './NotificationBell.css';

// ... (la función timeAgo no cambia)
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

    const queryKey = ['notifications'];

    const { data: notificationPage } = useQuery<NotificationPage, Error>({
        queryKey,
        queryFn: () => notificationService.getNotifications(0, 5),
        refetchInterval: 60000,
    });

    const markAsReadMutation = useMutation({
        mutationFn: notificationService.markAsRead,
        onMutate: async (notificationId: number) => {
            await queryClient.cancelQueries({ queryKey });
            const previousNotifications = queryClient.getQueryData<NotificationPage>(queryKey);
            queryClient.setQueryData<NotificationPage>(queryKey, oldData => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    content: oldData.content.map(n =>
                        n.id === notificationId ? { ...n, isRead: true } : n
                    ),
                };
            });
            return { previousNotifications };
        },
        // --- INICIO DE LA MODIFICACIÓN ---
        // La invalidación ahora solo ocurre en caso de éxito
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
        // --- FIN DE LA MODIFICACIÓN ---
        onError: (_err, _vars, context) => {
            if (context?.previousNotifications) {
                queryClient.setQueryData(queryKey, context.previousNotifications);
            }
        },
        // Se elimina onSettled para evitar la recarga prematura
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

    const notifications = notificationPage?.content ?? [];
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="notification-bell" ref={menuRef}>
            <button className="bell-trigger" onClick={() => setIsOpen(!isOpen)}>
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            {isOpen && (
                <div className="notification-dropdown">
                    {/* ... (el resto del JSX no cambia) ... */}
                    <div className="dropdown-header">
                        <h3>Notificaciones</h3>
                    </div>
                    <div className="notification-list">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <Link
                                    to="/notifications"
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