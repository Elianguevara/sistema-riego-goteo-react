// Archivo: src/pages/AuditLog.tsx

import { useState } from 'react';
// 1. Importa 'keepPreviousData' desde la librería
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import auditService from '../services/auditService';
import type { ChangeHistoryRequestParams, ChangeHistoryResponse, Page } from '../types/audit.types';
import './AuditLog.css';

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
        // 2. Reemplaza 'keepPreviousData' por 'placeholderData'
        placeholderData: keepPreviousData,
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value, page: 0 }));
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    return (
        <div className="audit-log-page">
            <div className="page-header">
                <h1>Historial de Auditoría</h1>
            </div>

            {/* Filtros */}
            <div className="filters-container">
                <input type="text" name="searchTerm" placeholder="Buscar en cambios..." value={filters.searchTerm} onChange={handleFilterChange} />
                <input type="number" name="userId" placeholder="ID de Usuario" value={filters.userId} onChange={handleFilterChange} />
                <input type="text" name="affectedTable" placeholder="Tabla Afectada" value={filters.affectedTable} onChange={handleFilterChange} />
                <select name="actionType" value={filters.actionType} onChange={handleFilterChange}>
                    <option value="">Todas las Acciones</option>
                    <option value="CREATE">CREAR</option>
                    <option value="UPDATE">ACTUALIZAR</option>
                    <option value="DELETE">ELIMINAR</option>
                </select>
                <input type="datetime-local" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                <input type="datetime-local" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
            </div>

            {/* Contenedor de la tabla */}
            <div className="audit-table-container">
                {isLoading ? <p>Cargando historial...</p> : isError ? <p className="error-text">Error: {error.message}</p> : (
                    <>
                        <table>
                            {/* ... thead ... */}
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
                                {historyPage?.content.map(log => (
                                    <tr key={log.id}>
                                        <td>{new Date(log.changeDatetime).toLocaleString('es-AR')}</td>
                                        <td>{log.username} ({log.userId})</td>
                                        <td><span className={`action-badge ${log.actionType.toLowerCase()}`}>{log.actionType}</span></td>
                                        <td>{log.affectedTable}</td>
                                        <td>{log.recordId}</td>
                                        <td>{log.fieldName || 'N/A'}</td>
                                        <td>{log.oldValue || 'N/A'}</td>
                                        <td>{log.newValue || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Paginación */}
                        <div className="pagination-controls">
                            <button onClick={() => handlePageChange(filters.page! - 1)} disabled={historyPage?.first || isFetching}>Anterior</button>
                            <span>Página {historyPage ? historyPage.number + 1 : 1} de {historyPage?.totalPages || 1}</span>
                            <button onClick={() => handlePageChange(filters.page! + 1)} disabled={historyPage?.last || isFetching}>Siguiente</button>
                        </div>
                    </>
                )}
                 {isFetching && <div className="loading-overlay">Cargando...</div>}
            </div>
        </div>
    );
};

export default AuditLog;