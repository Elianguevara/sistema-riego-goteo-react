// Archivo: src/pages/NotificationHistory.tsx

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import notificationService from '../services/notificationService';
import type { Notification, NotificationPage } from '../types/notification.types';
import './NotificationHistory.css';

// ... (la función timeAgo no cambia)
const timeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `hace ${Math.floor(interval)} años`;
    interval = seconds / 2592000;
    if (interval > 1) return `hace ${Math.floor(interval)} meses`;
    interval = seconds / 86400;
    if (interval > 1) return `hace ${Math.floor(interval)} días`;
    interval = seconds / 3600;
    if (interval > 1) return `hace ${Math.floor(interval)} horas`;
    interval = seconds / 60;
    if (interval > 1) return `hace ${Math.floor(interval)} minutos`;
    return "Hace un momento";
};


const NotificationHistory = () => {
    const queryClient = useQueryClient();
    const historyQueryKey = ['notifications', 'history'];
    const bellQueryKey = ['notifications'];

    const { data: notificationPage, isLoading } = useQuery<NotificationPage, Error>({
        queryKey: historyQueryKey,
        queryFn: () => notificationService.getNotifications(0, 20),
    });

    const markAsReadMutation = useMutation({
        mutationFn: notificationService.markAsRead,
        // --- INICIO DE LA MODIFICACIÓN: Lógica optimista y onSuccess ---
        onMutate: async (notificationId: number) => {
            // Cancelamos queries de ambas vistas (historial y campana)
            await queryClient.cancelQueries({ queryKey: historyQueryKey });
            await queryClient.cancelQueries({ queryKey: bellQueryKey });

            const previousHistory = queryClient.getQueryData<NotificationPage>(historyQueryKey);
            const previousBell = queryClient.getQueryData<NotificationPage>(bellQueryKey);

            // Actualización optimista para la página de historial
            queryClient.setQueryData<NotificationPage>(historyQueryKey, oldData => {
                if (!oldData) return oldData;
                return { ...oldData, content: oldData.content.map(n => n.id === notificationId ? { ...n, isRead: true } : n) };
            });

            // Actualización optimista para la campana
            queryClient.setQueryData<NotificationPage>(bellQueryKey, oldData => {
                if (!oldData) return oldData;
                return { ...oldData, content: oldData.content.map(n => n.id === notificationId ? { ...n, isRead: true } : n) };
            });

            return { previousHistory, previousBell };
        },
        onSuccess: () => {
            // Invalidamos ambas queries en caso de éxito para sincronizar con el servidor
            queryClient.invalidateQueries({ queryKey: historyQueryKey });
            queryClient.invalidateQueries({ queryKey: bellQueryKey });
        },
        onError: (_err, _vars, context) => {
            if (context?.previousHistory) {
                queryClient.setQueryData(historyQueryKey, context.previousHistory);
            }
            if (context?.previousBell) {
                queryClient.setQueryData(bellQueryKey, context.previousBell);
            }
        },
        // --- FIN DE LA MODIFICACIÓN ---
    });

    const handleMarkAsRead = (notification: Notification) => {
        if (!notification.isRead) {
            markAsReadMutation.mutate(notification.id);
        }
    };

    if (isLoading) {
        return <div className="notification-history-page">Cargando historial...</div>;
    }

    const notifications = notificationPage?.content ?? [];

    return (
        <div className="notification-history-page">
            {/* ... (el resto del JSX no cambia) ... */}
            <div className="page-header">
                <h1>Historial de Notificaciones</h1>
            </div>

            <div className="history-list-container">
                {notifications.length > 0 ? (
                    notifications.map(n => (
                        <div key={n.id} className={`history-item ${n.isRead ? 'read' : 'unread'}`}>
                            <div className="item-icon">
                                <i className={`fas ${n.isRead ? 'fa-check-circle' : 'fa-bell'}`}></i>
                            </div>
                            <div className="item-content">
                                <p className="item-message">{n.message}</p>
                                <span className="item-time">{timeAgo(n.createdAt)}</span>
                                {n.link && <Link to={n.link} className="item-link">Ver detalle</Link>}
                            </div>
                            {!n.isRead && (
                                <button
                                    className="btn-mark-read"
                                    onClick={() => handleMarkAsRead(n)}
                                    disabled={markAsReadMutation.isPending}
                                >
                                    Marcar como leída
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="empty-history">
                        <p>No hay notificaciones para mostrar.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationHistory;