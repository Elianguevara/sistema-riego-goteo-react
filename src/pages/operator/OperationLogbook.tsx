// Archivo: src/pages/operator/OperationLogbook.tsx

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import farmService from '../../services/farmService';
import operationLogService from '../../services/operationLogService';
import type { Farm } from '../../types/farm.types';
import type { OperationLog } from '../../types/operationLog.types';
import OperationLogForm from '../../components/logbook/OperationLogForm';
import ActionsMenu, { type ActionMenuItem } from '../../components/ui/ActionsMenu';
import { useDebounce } from '../../hooks/useDebounce';
import './RegisterIrrigation.css';
import './OperationLogbook.css';

// --- FUNCIONES HELPER PARA FECHAS ---

const formatDateTime = (isoString: string | null) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }) + ' hs';
};

const formatEventDateGroup = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    if (date.toDateString() === today.toDateString()) return `Hoy (${date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })})`;
    if (date.toDateString() === yesterday.toDateString()) return `Ayer (${date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })})`;
    return date.toLocaleDateString('es-AR', options);
};

// --- COMPONENTE MEJORADO PARA LISTAR ENTRADAS ---

const LogList = ({ farmId, filterType, onEdit }: { farmId: number, filterType: string, onEdit: (log: OperationLog) => void }) => {
    const { data: logs = [], isLoading } = useQuery<OperationLog[], Error>({
        queryKey: ['operationLogs', farmId, filterType],
        queryFn: () => operationLogService.getOperationLogsByFarm(farmId, filterType),
    });

    const getLogActions = (log: OperationLog): ActionMenuItem[] => [
        { label: 'Editar', action: () => onEdit(log) },
    ];

    const groupedLogs = useMemo(() => {
        if (!logs) return {};
        return logs.reduce((acc, log) => {
            const dateGroup = formatEventDateGroup(log.operationDatetime);
            if (!acc[dateGroup]) acc[dateGroup] = [];
            acc[dateGroup].push(log);
            return acc;
        }, {} as Record<string, OperationLog[]>);
    }, [logs]);

    if (isLoading) return <p>Cargando bitácora...</p>;
    const dateGroups = Object.keys(groupedLogs);

    return (
        <div className="log-list-container">
            {dateGroups.length > 0 ? (
                dateGroups.map(dateGroup => (
                    <div key={dateGroup} className="log-day-group">
                        <h3 className="log-day-header">{dateGroup}</h3>
                        {groupedLogs[dateGroup].map(log => (
                            <div key={log.id} className="log-card">
                                <div className="log-card-icon"><i className="fas fa-file-alt"></i></div>
                                <div className="log-card-content">
                                    <p className="log-description">
                                        <strong>{log.operationType}:</strong> {log.description || 'Sin descripción detallada.'}
                                    </p>
                                    <div className="log-meta">
                                        <span><i className="fas fa-calendar-alt"></i> Fecha: {formatDateTime(log.operationDatetime)}</span>
                                        <span><i className="fas fa-user"></i> Por: {log.createdByUsername}</span>
                                    </div>
                                </div>
                                <div className="log-actions">
                                    <ActionsMenu items={getLogActions(log)} />
                                </div>
                            </div>
                        ))}
                    </div>
                ))
            ) : <div className="empty-state"><p>No se encontraron entradas para los filtros seleccionados.</p></div>}
        </div>
    );
};

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---

const OperationLogbook = () => {
    const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [currentLog, setCurrentLog] = useState<OperationLog | null>(null);
    const [filterInput, setFilterInput] = useState('');
    const debouncedFilter = useDebounce(filterInput, 300);

    const { data: farms = [] } = useQuery<Farm[]>({ queryKey: ['myFarms'], queryFn: farmService.getFarms });

    useEffect(() => {
        if (!selectedFarmId && farms.length > 0) {
            setSelectedFarmId(farms[0].id);
        }
    }, [farms, selectedFarmId]);

    const handleOpenCreateForm = () => {
        setCurrentLog(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditForm = (log: OperationLog) => {
        setCurrentLog(log);
        setIsFormModalOpen(true);
    };
    
    return (
        <div className="register-irrigation-page">
            <h1>Bitácora de Operaciones</h1>
            <div className="filters-bar">
                {farms.length > 1 ? (
                    <select onChange={(e) => setSelectedFarmId(Number(e.target.value))} value={selectedFarmId || ''}>
                        <option value="">Seleccione Finca...</option>
                        {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                ) : (
                     <div className="farm-display"><strong>Finca:</strong> {farms[0]?.name || 'Cargando...'}</div>
                )}
                
                <input
                    type="text"
                    placeholder="Filtrar por tipo de operación..."
                    value={filterInput}
                    onChange={(e) => setFilterInput(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--color-border)' }}
                />

                <button className="create-user-btn" onClick={handleOpenCreateForm} disabled={!selectedFarmId}>
                     <i className="fas fa-plus"></i>
                     Nueva Entrada
                </button>
            </div>

            {selectedFarmId && <LogList farmId={selectedFarmId} filterType={debouncedFilter} onEdit={handleOpenEditForm} />}

            {isFormModalOpen && selectedFarmId && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <OperationLogForm 
                            farmId={selectedFarmId} 
                            currentLog={currentLog}
                            onClose={() => setIsFormModalOpen(false)}
                            // --- LÍNEA CORREGIDA (eliminada la prop onSave) ---
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default OperationLogbook;