// Archivo: src/pages/operator/OperationLogbook.tsx

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import farmService from '../../services/farmService';
import operationLogService from '../../services/operationLogService';
import type { Farm } from '../../types/farm.types';
import type { OperationLog } from '../../types/operationLog.types';
import OperationLogForm from '../../components/logbook/OperationLogForm';
import ActionsMenu, { type ActionMenuItem } from '../../components/ui/ActionsMenu';
import './RegisterIrrigation.css'; 

// Helper para formatear fechas
const formatDateTime = (isoString: string | null) => {
    if (!isoString) return 'En curso...';
    return new Date(isoString).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Componente para listar las entradas de la bitácora
const LogList = ({ farmId, onEdit }: { farmId: number, onEdit: (log: OperationLog) => void }) => {
    const { data: logs = [], isLoading } = useQuery<OperationLog[], Error>({
        queryKey: ['operationLogs', farmId],
        queryFn: () => operationLogService.getOperationLogsByFarm(farmId),
    });

    const getLogActions = (log: OperationLog): ActionMenuItem[] => [
        { label: 'Editar', action: () => onEdit(log) },
    ];

    if (isLoading) return <p>Cargando bitácora...</p>;

    return (
        <div className="user-table-container" style={{ marginTop: '20px' }}>
            {logs.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Descripción</th>
                            <th>Inicio</th>
                            <th>Fin</th>
                            <th>Registrado por</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td>{log.description}</td>
                                <td>{formatDateTime(log.startDatetime)}</td>
                                <td>{formatDateTime(log.endDatetime)}</td>
                                <td>{log.createdByUsername}</td>
                                <td className="actions">
                                    <ActionsMenu items={getLogActions(log)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : <div className="empty-state" style={{marginTop: '0'}}><p>No hay entradas en la bitácora para esta finca.</p></div>}
        </div>
    );
};


// Componente principal de la página
const OperationLogbook = () => {
    const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [currentLog, setCurrentLog] = useState<OperationLog | null>(null);

    const { data: farms = [] } = useQuery<Farm[]>({ queryKey: ['myFarms'], queryFn: farmService.getFarms });

    useEffect(() => {
        if (!selectedFarmId && farms.length > 0) {
            // Selecciona la primera finca por defecto si no hay ninguna seleccionada
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
                        <option value="">Seleccione una Finca...</option>
                        {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                ) : (
                     <div className="farm-display">
                        <strong>Finca:</strong> {farms[0]?.name || 'Cargando...'}
                    </div>
                )}
                
                <button className="create-user-btn" onClick={handleOpenCreateForm} disabled={!selectedFarmId}>
                     <i className="fas fa-plus"></i>
                     Nueva Entrada
                </button>
            </div>

            {selectedFarmId && <LogList farmId={selectedFarmId} onEdit={handleOpenEditForm} />}

            {isFormModalOpen && selectedFarmId && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <OperationLogForm 
                            farmId={selectedFarmId} 
                            currentLog={currentLog}
                            onClose={() => setIsFormModalOpen(false)}
                            onSave={() => setIsFormModalOpen(false)} // Cierra el modal al guardar
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default OperationLogbook;