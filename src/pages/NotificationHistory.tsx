// Archivo: src/pages/NotificationHistory.tsx

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import notificationService from '../services/notificationService';
import type { Notification } from '../types/notification.types';
import './NotificationHistory.css'; // Crearemos este archivo a continuación

// Reutilizamos la función de tiempo relativo
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
    // Podríamos añadir un estado para la paginación si quisiéramos
    // const [page, setPage] = useState(0);

    const { data: notificationPage, isLoading } = useQuery({
        queryKey: ['notifications', 'history'], // Usamos una key diferente para no colisionar con la campana
        queryFn: () => notificationService.getNotifications(0, 20), // Traemos más items para la página de historial
    });

    const markAsReadMutation = useMutation({
        mutationFn: notificationService.markAsRead,
        onSuccess: () => {
            // Invalida ambas queries de notificaciones para que se actualicen
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
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
            {/* Aquí irían los controles de paginación en una implementación más avanzada */}
        </div>
    );
};

export default NotificationHistory;