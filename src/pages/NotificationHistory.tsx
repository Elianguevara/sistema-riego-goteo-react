// src/pages/NotificationHistory.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import notificationService from '../services/notificationService';
import type { Notification, NotificationPage } from '../types/notification.types';
import './NotificationHistory.css';

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
    const [page, setPage] = useState(0);
    const [size, ] = useState(6); // Tamaño de página fijado en 6
    
    const historyQueryKey = ['notifications', 'history', page, size];

    const { data: notificationPage, isLoading, isFetching } = useQuery<NotificationPage, Error>({
        queryKey: historyQueryKey,
        queryFn: () => notificationService.getNotifications(page, size),
    });

    const markAsReadMutation = useMutation({
        mutationFn: notificationService.markAsRead,
        onMutate: async (notificationId: number) => {
            await queryClient.cancelQueries({ queryKey: historyQueryKey });
            const previousHistory = queryClient.getQueryData<NotificationPage>(historyQueryKey);
            queryClient.setQueryData<NotificationPage>(historyQueryKey, oldData => {
                if (!oldData) return oldData;
                return { ...oldData, content: oldData.content.map(n => n.id === notificationId ? { ...n, isRead: true } : n) };
            });
            return { previousHistory };
        },
        onSuccess: () => {
            // Se restaura el toast de éxito
            toast.success("Notificación marcada como leída.");
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
        onError: (err: Error, _vars, context) => {
            toast.error(err.message || "No se pudo marcar como leída.");
            if (context?.previousHistory) {
                queryClient.setQueryData(historyQueryKey, context.previousHistory);
            }
        },
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
                                    disabled={markAsReadMutation.isPending && markAsReadMutation.variables === n.id}
                                >
                                    {markAsReadMutation.isPending && markAsReadMutation.variables === n.id 
                                        ? 'Marcando...' 
                                        : 'Marcar como leída'}
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

            {notificationPage && notificationPage.totalPages > 1 && (
                <div className="pagination-controls" style={{ marginTop: '20px' }}>
                    <button onClick={() => setPage(page - 1)} disabled={notificationPage.first || isFetching}>
                        Anterior
                    </button>
                    <span>Página {notificationPage.number + 1} de {notificationPage.totalPages}</span>
                    <button onClick={() => setPage(page + 1)} disabled={notificationPage.last || isFetching}>
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationHistory;