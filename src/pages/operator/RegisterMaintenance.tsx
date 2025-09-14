import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import farmService from '../../services/farmService';
import maintenanceService from '../../services/maintenanceService';
import type { Farm, IrrigationEquipment } from '../../types/farm.types';
import type { MaintenanceRecord } from '../../types/maintenance.types';
import MaintenanceForm from '../../components/maintenance/MaintenanceForm';
import './RegisterIrrigation.css'; // Usa los mismos estilos

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
    const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>();
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | undefined>();
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: farms = [] } = useQuery<Farm[]>({ queryKey: ['myFarms'], queryFn: farmService.getFarms });

    useEffect(() => {
        if (selectedFarmId || farms.length !== 1) return;
        setSelectedFarmId(farms[0].id);
    }, [farms, selectedFarmId]);

    const { data: equipments = [] } = useQuery<IrrigationEquipment[]>({
        queryKey: ['equipments', selectedFarmId],
        queryFn: () => farmService.getEquipmentsByFarm(selectedFarmId!),
        enabled: !!selectedFarmId,
    });

    const handleFarmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const farmId = e.target.value ? Number(e.target.value) : undefined;
        setSelectedFarmId(farmId);
        setSelectedEquipmentId(undefined);
        setIsFormOpen(false);
    };
    
    const handleEquipmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const equipmentId = e.target.value ? Number(e.target.value) : undefined;
        setSelectedEquipmentId(equipmentId);
        setIsFormOpen(false);
    };

    return (
        <div className="register-irrigation-page">
            <h1>Registro de Mantenimiento</h1>
            <div className="filters-bar">
                {farms.length === 1 ? (
                    <div className="farm-display">
                        <strong>Finca:</strong> {farms[0].name}
                    </div>
                ) : (
                    <select onChange={handleFarmChange} value={selectedFarmId || ''}>
                        <option value="">Seleccione una Finca...</option>
                        {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                )}
                <select onChange={handleEquipmentChange} value={selectedEquipmentId || ''} disabled={!selectedFarmId}>
                    <option value="">Seleccione un Equipo...</option>
                    {equipments.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <button className="create-user-btn" onClick={() => setIsFormOpen(!isFormOpen)} disabled={!selectedEquipmentId}>
                     <i className={`fas ${isFormOpen ? 'fa-times' : 'fa-plus'}`}></i>
                     {isFormOpen ? 'Cancelar' : 'Nuevo Mantenimiento'}
                </button>
            </div>

            {isFormOpen && selectedFarmId && selectedEquipmentId && (
                <MaintenanceForm farmId={selectedFarmId} equipmentId={selectedEquipmentId} onClose={() => setIsFormOpen(false)} />
            )}

            {selectedFarmId && selectedEquipmentId && (
                <MaintenanceList farmId={selectedFarmId} equipmentId={selectedEquipmentId} />
            )}
        </div>
    );
};

export default RegisterMaintenance;