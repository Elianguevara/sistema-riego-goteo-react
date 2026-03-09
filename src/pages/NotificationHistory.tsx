// src/pages/NotificationHistory.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import notificationService from '../services/notificationService';
import type { Notification as AppNotification, NotificationPage } from '../types/notification.types';
import { useAuthData } from '../hooks/useAuthData';
import { resolveNotificationUrl } from '../utils/notificationNavigation';
import './NotificationHistory.css';
import { BellOff, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import LoadingState from '../components/ui/LoadingState';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';

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
    const navigate = useNavigate();
    const authData = useAuthData();
    const [page, setPage] = useState(0);
    const [size,] = useState(10);

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
                return { ...oldData, content: oldData.content.map(n => n.id === notificationId ? { ...n, read: true } : n) };
            });
            return { previousHistory };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
        onError: (err: Error, _vars, context) => {
            toast.error(err.message || "No se pudo marcar como leída.");
            if (context?.previousHistory) {
                queryClient.setQueryData(historyQueryKey, context.previousHistory);
            }
        },
    });

    const handleNotificationClick = async (notification: AppNotification) => {
        const targetUrl = resolveNotificationUrl(notification, authData?.role);

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

    if (isLoading) {
        return <LoadingState message="Cargando historial..." />;
    }

    const notifications = notificationPage?.content ?? [];

    const getIconForType = (type: string, read: boolean) => {
        if (read) return <CheckCircle size={16} className="icon-read" />;
        switch (type) {
            case 'SUCCESS': return <CheckCircle size={16} className="icon-success" />;
            case 'WARNING': return <AlertTriangle size={16} className="icon-warning" />;
            case 'INFO':
            default: return <Info size={16} className="icon-info" />;
        }
    };

    return (
        <div className="notification-history-page">
            <PageHeader title="Historial de Notificaciones" />

            <div className="history-list-container">
                {notifications.length > 0 ? (
                    notifications.map(n => {
                        const canNavigate = Boolean(resolveNotificationUrl(n, authData?.role));

                        return (
                            <div key={n.id} className={`history-item ${n.read ? 'read' : 'unread'} type-${n.type?.toLowerCase() || 'info'}`}>
                                <div className="item-icon">
                                    {getIconForType(n.type, n.read)}
                                </div>
                                <div className="item-content">
                                    <p className="item-message">{n.message}</p>
                                    <span className="item-time">{timeAgo(n.createdAt)}</span>
                                    {canNavigate && (
                                        <button className="item-link" onClick={() => handleNotificationClick(n)}>
                                            Ver detalle
                                        </button>
                                    )}
                                </div>

                                {!n.read && (
                                    <button
                                        className="btn-mark-read"
                                        onClick={() => markAsReadMutation.mutate(n.id)}
                                        disabled={markAsReadMutation.isPending && markAsReadMutation.variables === n.id}
                                    >
                                        {markAsReadMutation.isPending && markAsReadMutation.variables === n.id
                                            ? 'Marcando...'
                                            : 'Marcar como leída'}
                                    </button>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <EmptyState
                        icon={<BellOff size={24} />}
                        title="No hay notificaciones"
                        subtitle="Cuando recibas notificaciones, aparecerán aquí."
                    />
                )}
            </div>

            {notificationPage && notificationPage.totalPages > 1 && (
                <div className="pagination-controls">
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

