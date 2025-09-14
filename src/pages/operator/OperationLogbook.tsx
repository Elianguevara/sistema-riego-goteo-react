// Archivo: src/pages/operator/OperationLogbook.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import farmService from '../../services/farmService';
import operationLogService from '../../services/operationLogService';
import type { Farm } from '../../types/farm.types';
import type { OperationLog } from '../../types/operationLog.types';
import OperationLogForm from '../../components/logbook/OperationLogForm';
import './RegisterIrrigation.css'; // Reutilizamos estos estilos

// Componente para mostrar la lista de logs
const LogList = ({ farmId }: { farmId: number }) => {
    const { data: logs = [], isLoading } = useQuery<OperationLog[], Error>({
        queryKey: ['operationLogs', farmId],
        queryFn: () => operationLogService.getOperationLogsByFarm(farmId),
    });

    if (isLoading) return <p>Cargando bitácora...</p>;

    return (
        <div style={{ marginTop: '20px' }}>
            {logs.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Descripción</th>
                            <th>Registrado por</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td>{new Date(log.logDate + 'T00:00:00').toLocaleDateString()}</td>
                                <td>{log.description}</td>
                                <td>{log.createdByUsername}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : <div className="empty-state" style={{marginTop: '20px'}}><p>No hay entradas en la bitácora para esta finca.</p></div>}
        </div>
    );
};

const OperationLogbook = () => {
    const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>();
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: farms = [] } = useQuery<Farm[]>({ queryKey: ['myFarms'], queryFn: farmService.getFarms });

    return (
        <div className="register-irrigation-page">
            <h1>Bitácora de Operaciones</h1>
            <div className="filters-bar">
                <select onChange={(e) => setSelectedFarmId(Number(e.target.value))} value={selectedFarmId || ''}>
                    <option value="">Seleccione una Finca...</option>
                    {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <button className="create-user-btn" onClick={() => setIsFormOpen(!isFormOpen)} disabled={!selectedFarmId}>
                     <i className={`fas ${isFormOpen ? 'fa-times' : 'fa-plus'}`}></i>
                     {isFormOpen ? 'Cancelar' : 'Nueva Entrada'}
                </button>
            </div>

            {isFormOpen && selectedFarmId && (
                <div className="modal-overlay">
                    <OperationLogForm farmId={selectedFarmId} onClose={() => setIsFormOpen(false)} />
                </div>
            )}

            {selectedFarmId && <LogList farmId={selectedFarmId} />}
        </div>
    );
};

export default OperationLogbook;