// Archivo: src/pages/AuditLog.tsx

import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import auditService from '../services/auditService';
import type { ChangeHistoryRequestParams, ChangeHistoryResponse, Page } from '../types/audit.types';
import './AuditLog.css';

// Pequeña función de ayuda para formatear fechas de forma segura
const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString('es-AR');
    } catch (e) {
        return 'Fecha inválida';
    }
};

const AuditLog = () => {
    const [filters, setFilters] = useState<ChangeHistoryRequestParams>({
        page: 0,
        size: 10,
        sort: 'changeDatetime,desc',
        searchTerm: '',
        userId: '',
        affectedTable: '',
        actionType: '',
        startDate: '',
        endDate: '',
    });

    const { data: historyPage, isLoading, isError, error, isFetching } = useQuery<Page<ChangeHistoryResponse>, Error>({
        queryKey: ['changeHistory', filters],
        queryFn: () => auditService.getChangeHistory(filters),
        placeholderData: keepPreviousData,
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value, page: 0 }));
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const renderContent = () => {
        if (isLoading) {
            return <p>Cargando historial de auditoría...</p>;
        }

        if (isError) {
            return <p className="error-text">Error al cargar: {error.message}</p>;
        }

        if (!historyPage || historyPage.content.length === 0) {
            return (
                <div className="empty-state">
                    <i className="fas fa-file-alt empty-icon"></i>
                    <h3>No se encontraron registros</h3>
                    <p>No hay datos de auditoría que coincidan con los filtros actuales.</p>
                </div>
            );
        }
        
        return (
            <>
                <table>
                    <thead>
                        <tr>
                            <th>Fecha y Hora</th>
                            <th>Usuario</th>
                            <th>Acción</th>
                            <th>Tabla</th>
                            <th>ID Registro</th>
                            <th>Campo</th>
                            <th>Valor Antiguo</th>
                            <th>Valor Nuevo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historyPage.content.map(log => (
                            <tr key={log.id}>
                                <td>{formatDate(log.changeDatetime)}</td>
                                <td>{log.username || 'N/A'} ({log.userId})</td>
                                <td>
                                    {/* Con el optional chaining (?.), si actionType es null, no se producirá un error */}
                                    <span className={`action-badge ${log.actionType?.toLowerCase() || ''}`}>
                                        {log.actionType || 'N/A'}
                                    </span>
                                </td>
                                <td>{log.affectedTable || 'N/A'}</td>
                                <td>{log.recordId}</td>
                                <td>{log.changedField || 'N/A'}</td>
                                <td>{log.oldValue || 'N/A'}</td>
                                <td>{log.newValue || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="pagination-controls">
                    <button onClick={() => handlePageChange(filters.page! - 1)} disabled={historyPage.first || isFetching}>Anterior</button>
                    <span>Página {historyPage.number + 1} de {historyPage.totalPages || 1}</span>
                    <button onClick={() => handlePageChange(filters.page! + 1)} disabled={historyPage.last || isFetching}>Siguiente</button>
                </div>
            </>
        );
    };

    return (
        <div className="audit-log-page">
            <div className="page-header">
                <h1>Historial de Auditoría</h1>
            </div>
            <div className="filters-container">
                <input type="text" name="searchTerm" placeholder="Buscar en cambios..." value={filters.searchTerm || ''} onChange={handleFilterChange} />
                <input type="number" name="userId" placeholder="ID de Usuario" value={filters.userId || ''} onChange={handleFilterChange} />
                <input type="text" name="affectedTable" placeholder="Tabla Afectada" value={filters.affectedTable || ''} onChange={handleFilterChange} />
                <select name="actionType" value={filters.actionType || ''} onChange={handleFilterChange}>
                    <option value="">Todas las Acciones</option>
                    <option value="CREATE">CREAR</option>
                    <option value="UPDATE">ACTUALIZAR</option>
                    <option value="DELETE">ELIMINAR</option>
                    <option value="ASSIGN">ASIGNAR</option>
                    <option value="UNASSIGN">DESASIGNAR</option>
                </select>
                <input type="datetime-local" name="startDate" value={filters.startDate || ''} onChange={handleFilterChange} />
                <input type="datetime-local" name="endDate" value={filters.endDate || ''} onChange={handleFilterChange} />
            </div>
            <div className="audit-table-container">
                {renderContent()}
                {isFetching && !isLoading && <div className="loading-overlay">Actualizando...</div>}
            </div>
        </div>
    );
};

export default AuditLog;
