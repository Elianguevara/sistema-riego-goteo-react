// Archivo: src/pages/operator/OperationLogbook.tsx

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import farmService from '../../services/farmService';
import operationLogService from '../../services/operationLogService';
import type { Farm } from '../../types/farm.types';
import type { OperationLog } from '../../types/operationLog.types';
import OperationLogForm from '../../components/logbook/OperationLogForm';
import Modal from '../../components/ui/Modal';
import TableToolbar from '../../components/ui/TableToolbar';
import ActionsMenu, { type ActionMenuItem } from '../../components/ui/ActionsMenu';
import { useDebounce } from '../../hooks/useDebounce';
import './RegisterIrrigation.css';
import './OperationLogbook.css';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import { ClipboardList, FileText, Calendar, User, Plus } from 'lucide-react';

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

    if (isLoading) return <LoadingState message="Cargando bitácora..." />;
    const dateGroups = Object.keys(groupedLogs);

    return (
        <div className="log-list-container">
            {dateGroups.length > 0 ? (
                dateGroups.map(dateGroup => (
                    <div key={dateGroup} className="log-day-group">
                        <h3 className="log-day-header">{dateGroup}</h3>
                        {groupedLogs[dateGroup].map(log => (
                            <div key={log.id} className="log-card">
                                <div className="log-card-icon"><FileText size={18} /></div>
                                <div className="log-card-content">
                                    <p className="log-description">
                                        <strong>{log.operationType}:</strong> {log.description || 'Sin descripción detallada.'}
                                    </p>
                                    <div className="log-meta">
                                        <span><Calendar size={14} /> Fecha: {formatDateTime(log.operationDatetime)}</span>
                                        <span><User size={14} /> Por: {log.createdByUsername}</span>
                                    </div>
                                </div>
                                <div className="log-actions">
                                    <ActionsMenu items={getLogActions(log)} />
                                </div>
                            </div>
                        ))}
                    </div>
                ))
            ) : (
                <EmptyState
                    icon={<ClipboardList size={24} />}
                    title="No se encontraron entradas"
                    subtitle="No hay registros para los filtros seleccionados."
                />
            )}
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
            <TableToolbar
                searchValue={filterInput}
                onSearchChange={setFilterInput}
                searchPlaceholder="Filtrar por tipo de operación..."
            >
                {farms.length > 1 ? (
                    <select onChange={(e) => setSelectedFarmId(Number(e.target.value))} value={selectedFarmId || ''}>
                        <option value="">Seleccione Finca...</option>
                        {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                ) : (
                    <div className="farm-display"><strong>Finca:</strong> {farms[0]?.name || 'Cargando...'}</div>
                )}
                <button className="create-user-btn" onClick={handleOpenCreateForm} disabled={!selectedFarmId}>
                    <Plus size={16} />
                    Nueva Entrada
                </button>
            </TableToolbar>

            {selectedFarmId && <LogList farmId={selectedFarmId} filterType={debouncedFilter} onEdit={handleOpenEditForm} />}

            {selectedFarmId && (
                <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)}>
                    <OperationLogForm
                        farmId={selectedFarmId}
                        currentLog={currentLog}
                        onClose={() => setIsFormModalOpen(false)}
                    />
                </Modal>
            )}
        </div>
    );
};

export default OperationLogbook;