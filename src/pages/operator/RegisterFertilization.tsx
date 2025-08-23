// Archivo: src/pages/operator/RegisterFertilization.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import farmService from '../../services/farmService';
import type { Farm, Sector } from '../../types/farm.types';
import FertilizationForm from '../../components/fertilization/FertilizationForm';
import './RegisterIrrigation.css'; // Reutilizamos estilos

const RegisterFertilization = () => {
    const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>();
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: farms = [], isLoading: isLoadingFarms } = useQuery<Farm[], Error>({
        queryKey: ['myFarms'], // Puede reutilizar la caché de fincas si ya existe
        queryFn: () => farmService.getFarms(),
    });

    const { data: sectors = [], isLoading: isLoadingSectors } = useQuery<Sector[], Error>({
        queryKey: ['sectors', selectedFarmId],
        queryFn: () => farmService.getSectorsByFarm(selectedFarmId!),
        enabled: !!selectedFarmId,
    });
    
    const handleOpenForm = () => {
        if (selectedFarmId) {
            setIsFormOpen(true);
        }
    };

    const renderContent = () => {
        if (isLoadingFarms) {
            return <p>Cargando fincas asignadas...</p>;
        }
        if (farms.length === 0) {
            return (
                <div className="empty-state">
                    <i className="fas fa-seedling empty-icon"></i>
                    <h3>No tienes fincas asignadas</h3>
                    <p>Contacta a un administrador para que te asigne a una finca.</p>
                </div>
            );
        }

        return (
            <>
                <div className="filters-bar">
                    <select onChange={(e) => setSelectedFarmId(e.target.value ? Number(e.target.value) : undefined)} value={selectedFarmId || ''}>
                        <option value="">Seleccione una finca para registrar</option>
                        {farms.map(farm => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
                    </select>
                    <button className="create-user-btn" onClick={handleOpenForm} disabled={!selectedFarmId || isLoadingSectors}>
                        <i className="fas fa-plus"></i> Registrar Aplicación
                    </button>
                </div>
                
                {!selectedFarmId && (
                     <div className="empty-state">
                        <i className="fas fa-hand-pointer empty-icon"></i>
                        <h3>Seleccione una Finca</h3>
                        <p>Por favor, elija una finca para poder registrar una nueva aplicación de fertilizante.</p>
                    </div>
                )}

                {isFormOpen && selectedFarmId && (
                    <FertilizationForm
                        farmId={selectedFarmId}
                        sectors={sectors}
                        onClose={() => setIsFormOpen(false)}
                    />
                )}
            </>
        );
    };

    return (
        <div className="register-irrigation-page">
            <h1>Registro de Fertilización</h1>
            {renderContent()}
        </div>
    );
};

export default RegisterFertilization;