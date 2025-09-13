// src/pages/AuditLog.tsx

import { useState, useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import auditService from '../services/auditService';
import adminService from '../services/adminService';
import { useDebounce } from '../hooks/useDebounce';
import type { ChangeHistoryRequestParams, ChangeHistoryResponse, Page } from '../types/audit.types';
import type { UserResponse } from '../types/user.types';
import './AuditLog.css';

// --- HELPERS (Funciones de Ayuda) ---

const getActionDetails = (actionType: ChangeHistoryResponse['actionType']) => {
    switch (actionType) {
        case 'CREATE': return { icon: 'fa-plus', color: 'create', text: 'Creó' };
        case 'UPDATE': return { icon: 'fa-pencil-alt', color: 'update', text: 'Actualizó' };
        case 'DELETE': return { icon: 'fa-trash-alt', color: 'delete', text: 'Eliminó' };
        case 'ASSIGN': return { icon: 'fa-link', color: 'assign', text: 'Asignó' };
        case 'UNASSIGN': return { icon: 'fa-unlink', color: 'unassign', text: 'Desasignó' };
        default: return { icon: 'fa-question-circle', color: 'default', text: 'Acción desconocida' };
    }
};

const formatEventDateGroup = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    if (date.toDateString() === today.toDateString()) {
        return `Hoy (${date.toLocaleDateString('es-AR', options)})`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
        return `Ayer (${date.toLocaleDateString('es-AR', options)})`;
    }
    return date.toLocaleDateString('es-AR', options);
};

const formatEventTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return "Hace un momento";
    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) return `Hace ${diffMinutes} minutos`;
    
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + ' hs';
};


// --- COMPONENTE DE TARJETA DE EVENTO ---

const EventCard = ({ log }: { log: ChangeHistoryResponse }) => {
    const { icon, color, text } = getActionDetails(log.actionType);

    const renderChange = () => {
        if (log.actionType !== 'UPDATE' || !log.changedField) return null;
        return (
            <div className="event-change">
                <strong>Cambio:</strong>
                <div className="diff">
                    <del>{log.oldValue || 'vacío'}</del>
                    <ins>{log.newValue || 'vacío'}</ins>
                </div>
            </div>
        );
    };

    return (
        <div className={`event-card ${color}`}>
            <div className="event-icon-container">
                <i className={`fas ${icon}`}></i>
            </div>
            <div className="event-content">
                <div className="event-header">
                    <span className="event-action-text">{text}</span>
                    <span className="event-time">{formatEventTime(log.changeDatetime)}</span>
                </div>
                <div className="event-details">
                    <div className="detail-item"><strong>Quién:</strong><span>{log.username} ({log.userId})</span></div>
                    <div className="detail-item"><strong>Qué:</strong><span>{log.affectedTable} (ID: {log.recordId})</span></div>
                    {log.changedField && <div className="detail-item"><strong>Campo:</strong><span>{log.changedField}</span></div>}
                </div>
                {renderChange()}
            </div>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---

const AuditLog = () => {
    const [filters, setFilters] = useState<ChangeHistoryRequestParams>({
        page: 0,
        size: 25,
        sort: 'changeDatetime,desc',
        searchTerm: '',
        userId: '',
        affectedTable: '',
        actionType: '',
    });
    
    const debouncedSearchTerm = useDebounce(filters.searchTerm, 500);

    const queryFilters = useMemo(() => ({ ...filters, searchTerm: debouncedSearchTerm }), [filters, debouncedSearchTerm]);

    const { data: historyPage, isLoading, isError, error, isFetching } = useQuery<Page<ChangeHistoryResponse>, Error>({
        queryKey: ['changeHistory', queryFilters],
        queryFn: () => auditService.getChangeHistory(queryFilters),
        placeholderData: keepPreviousData,
    });
    
    // --- ¡ESTA ES LA CORRECCIÓN! ---
    // La query ahora extrae el `content` de la respuesta paginada.
    const { data: users = [] } = useQuery<UserResponse[], Error>({
        queryKey: ['usersForFilter'], // Usamos una queryKey diferente para no interferir con otras vistas
        queryFn: async () => {
            const page = await adminService.getUsers({ size: 1000 }); // Pedimos muchos para el filtro
            return page.content;
        },
    });

    const affectedTables = ["User", "Farm", "Sector", "Equipment", "Task", "Irrigation", "Fertilization"];

    const groupedLogs = useMemo(() => {
        if (!historyPage?.content) return {};
        return historyPage.content.reduce((acc, log) => {
            const dateGroup = formatEventDateGroup(log.changeDatetime);
            if (!acc[dateGroup]) acc[dateGroup] = [];
            acc[dateGroup].push(log);
            return acc;
        }, {} as Record<string, ChangeHistoryResponse[]>);
    }, [historyPage]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value, page: 0 }));
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };
    
    const renderContent = () => {
        if (isLoading && !historyPage) return <p>Cargando historial de auditoría...</p>;
        if (isError) return <p className="error-text">Error al cargar: {error.message}</p>;
        const groups = Object.keys(groupedLogs);
        if (!isFetching && groups.length === 0) {
            return (
                <div className="empty-state">
                    <i className="fas fa-file-alt empty-icon"></i>
                    <h3>No se encontraron registros</h3>
                    <p>No hay datos de auditoría que coincidan con los filtros actuales.</p>
                </div>
            );
        }

        return (
            <div className="timeline-container">
                {groups.map(dateGroup => (
                    <div key={dateGroup} className="timeline-day-group">
                        <h2 className="timeline-day-header">{dateGroup}</h2>
                        <div className="events-list">
                            {groupedLogs[dateGroup].map(log => <EventCard key={log.id} log={log} />)}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="audit-log-page">
            <div className="page-header">
                <h1>Historial de Auditoría del Sistema</h1>
            </div>
            <div className="filters-container">
                <div className="filter-group main-filters">
                    <div className="filter-item">
                        <label>Usuario</label>
                        <select name="userId" value={filters.userId || ''} onChange={handleFilterChange}>
                            <option value="">Todos los Usuarios</option>
                            {users.map((user: UserResponse) => <option key={user.id} value={user.id}>{user.name} ({user.username})</option>)}
                        </select>
                    </div>
                     <div className="filter-item">
                        <label>Entidad Afectada</label>
                        <select name="affectedTable" value={filters.affectedTable || ''} onChange={handleFilterChange}>
                            <option value="">Todas las Entidades</option>
                            {affectedTables.map(table => <option key={table} value={table}>{table}</option>)}
                        </select>
                    </div>
                     <div className="filter-item">
                        <label>Acción</label>
                        <select name="actionType" value={filters.actionType || ''} onChange={handleFilterChange}>
                            <option value="">Todas las Acciones</option>
                            <option value="CREATE">Crear</option>
                            <option value="UPDATE">Actualizar</option>
                            <option value="DELETE">Eliminar</option>
                            <option value="ASSIGN">Asignar</option>
                            <option value="UNASSIGN">Desasignar</option>
                        </select>
                    </div>
                </div>
                <div className="filter-group search-filter">
                     <div className="filter-item">
                        <label>Búsqueda libre</label>
                        <input type="text" name="searchTerm" placeholder="Buscar en valores..." value={filters.searchTerm || ''} onChange={handleFilterChange} />
                    </div>
                </div>
            </div>

            <div className="audit-content-container">
                 {renderContent()}
                {isFetching && <div className="loading-overlay">Actualizando...</div>}
            </div>
             {historyPage && historyPage.totalPages > 1 && (
                <div className="pagination-controls">
                    <select name="size" value={filters.size} onChange={handleFilterChange} className="page-size-selector">
                        <option value="10">10 por pág.</option>
                        <option value="25">25 por pág.</option>
                        <option value="50">50 por pág.</option>
                    </select>
                    <button onClick={() => handlePageChange(filters.page! - 1)} disabled={historyPage.first || isFetching}>Anterior</button>
                    <span>Página {historyPage.number + 1} de {historyPage.totalPages || 1}</span>
                    <button onClick={() => handlePageChange(filters.page! + 1)} disabled={historyPage.last || isFetching}>Siguiente</button>
                </div>
            )}
        </div>
    );
};

export default AuditLog;