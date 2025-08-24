// Archivo: src/pages/operator/RegisterMaintenance.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import farmService from '../../services/farmService';
import maintenanceService from '../../services/maintenanceService';
import type { Farm, IrrigationEquipment } from '../../types/farm.types';
import type { MaintenanceRecord } from '../../types/maintenance.types';
import MaintenanceForm from '../../components/maintenance/MaintenanceForm';
// --- INICIO DE LA CORRECCIÓN ---
// La ruta correcta es './' porque el archivo CSS está en el mismo directorio.
import './RegisterIrrigation.css'; // Reutilizamos estilos
// --- FIN DE LA CORRECCIÓN ---

const MaintenanceList = ({ farmId, equipmentId }: { farmId: number, equipmentId: number }) => {
    const { data: records = [], isLoading } = useQuery<MaintenanceRecord[], Error>({
        queryKey: ['maintenances', equipmentId],
        queryFn: () => maintenanceService.getMaintenancesByEquipment(farmId, equipmentId),
    });

    if (isLoading) return <p>Cargando historial...</p>;

    return (
        <div style={{ marginTop: '20px' }}>
            <h4>Historial del Equipo</h4>
            {records.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Descripción</th>
                            <th>Horas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map(r => (
                            <tr key={r.id}>
                                <td>{new Date(r.date + 'T00:00:00').toLocaleDateString()}</td>
                                <td>{r.description}</td>
                                <td>{r.workHours || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : <p>No hay registros de mantenimiento para este equipo.</p>}
        </div>
    );
};

const RegisterMaintenance = () => {
    const [farmId, setFarmId] = useState<number | undefined>();
    const [equipmentId, setEquipmentId] = useState<number | undefined>();
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: farms = [] } = useQuery<Farm[]>({ queryKey: ['myFarms'], queryFn: farmService.getFarms });
    const { data: equipments = [] } = useQuery<IrrigationEquipment[]>({
        queryKey: ['equipments', farmId],
        queryFn: () => farmService.getEquipmentsByFarm(farmId!),
        enabled: !!farmId,
    });

    const handleFarmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFarmId(Number(e.target.value));
        setEquipmentId(undefined);
        setIsFormOpen(false);
    };
    
    const handleEquipmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEquipmentId(Number(e.target.value));
        setIsFormOpen(false);
    };

    return (
        <div className="register-irrigation-page">
            <h1>Registro de Mantenimiento</h1>
            <div className="filters-bar">
                <select onChange={handleFarmChange} value={farmId || ''}>
                    <option value="">Seleccione Finca...</option>
                    {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <select onChange={handleEquipmentChange} value={equipmentId || ''} disabled={!farmId}>
                    <option value="">Seleccione Equipo...</option>
                    {equipments.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <button className="create-user-btn" onClick={() => setIsFormOpen(!isFormOpen)} disabled={!equipmentId}>
                     <i className={`fas ${isFormOpen ? 'fa-times' : 'fa-plus'}`}></i>
                     {isFormOpen ? 'Cancelar' : 'Nuevo Mantenimiento'}
                </button>
            </div>

            {isFormOpen && farmId && equipmentId && (
                <MaintenanceForm farmId={farmId} equipmentId={equipmentId} onClose={() => setIsFormOpen(false)} />
            )}

            {equipmentId && farmId && (
                <MaintenanceList farmId={farmId} equipmentId={equipmentId} />
            )}
        </div>
    );
};

export default RegisterMaintenance;
