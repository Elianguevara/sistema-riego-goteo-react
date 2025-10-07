// Archivo: src/pages/operator/RegisterMaintenance.tsx

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import farmService from '../../services/farmService';
import maintenanceService from '../../services/maintenanceService';
import type { Farm, IrrigationEquipment } from '../../types/farm.types';
import type { MaintenanceRecord } from '../../types/maintenance.types';
import MaintenanceForm from '../../components/maintenance/MaintenanceForm';
import ActionsMenu, { type ActionMenuItem } from '../../components/ui/ActionsMenu';
import './RegisterIrrigation.css';
import './RegisterMaintenance.css'; // <-- Importamos los nuevos estilos

// --- COMPONENTE MEJORADO PARA LA LISTA DE MANTENIMIENTOS ---

const MaintenanceList = ({ farmId, equipmentId }: { farmId: number, equipmentId: number }) => {
    const { data: records = [], isLoading } = useQuery<MaintenanceRecord[], Error>({
        queryKey: ['maintenances', equipmentId],
        queryFn: () => maintenanceService.getMaintenancesByEquipment(farmId, equipmentId),
    });

    const getMaintenanceActions = (record: MaintenanceRecord): ActionMenuItem[] => [
        // Aquí se pueden añadir acciones futuras como "Editar" o "Eliminar"
        { label: 'Editar', action: () => alert(`Editando mantenimiento #${record.id}`) },
    ];
    
    if (isLoading) return <p>Cargando historial de mantenimiento...</p>;

    return (
        <div className="maintenance-list-container">
            <h4>Historial del Equipo</h4>
            {records.length > 0 ? (
                records.map(record => (
                    <div key={record.id} className="maintenance-card">
                        <div className="maintenance-card-icon"><i className="fas fa-tools"></i></div>
                        <div className="maintenance-card-content">
                            <div className="maintenance-card-header">
                                <span className="maintenance-date">
                                    {new Date(record.date + 'T00:00:00').toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                                <div className="maintenance-actions">
                                    <ActionsMenu items={getMaintenanceActions(record)} />
                                </div>
                            </div>
                            <p className="maintenance-description">{record.description}</p>
                            <div className="maintenance-meta">
                                <span><i className="fas fa-clock"></i> Horas de Trabajo: <strong>{record.workHours || 'No especificado'}</strong></span>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="empty-state">
                    <p>No hay registros de mantenimiento para este equipo.</p>
                </div>
            )}
        </div>
    );
};


// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---

const RegisterMaintenance = () => {
    const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>();
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | undefined>();
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: farms = [] } = useQuery<Farm[]>({ queryKey: ['myFarms'], queryFn: farmService.getFarms });

    useEffect(() => {
        if (!selectedFarmId && farms.length > 0) {
            setSelectedFarmId(farms[0].id);
        }
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
                {farms.length > 1 ? (
                    <select onChange={handleFarmChange} value={selectedFarmId || ''}>
                        <option value="">Seleccione una Finca...</option>
                        {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                ) : (
                    <div className="farm-display">
                        <strong>Finca:</strong> {farms[0]?.name || 'Cargando...'}
                    </div>
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