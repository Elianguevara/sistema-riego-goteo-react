// Archivo: src/pages/operator/RegisterFertilization.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import farmService from '../../services/farmService';
import type { Farm, Sector } from '../../types/farm.types';
import FertilizationForm from '../../components/fertilization/FertilizationForm';
import FertilizationList from '../../components/fertilization/FertilizationList'; // <-- 1. IMPORTAR
import './RegisterIrrigation.css';

const RegisterFertilization = () => {
    const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>();
    const [selectedSectorId, setSelectedSectorId] = useState<number | undefined>(); // <-- 2. NUEVO ESTADO
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: farms = [], isLoading: isLoadingFarms } = useQuery<Farm[], Error>({
        queryKey: ['myFarms'],
        queryFn: () => farmService.getFarms(),
    });

    const { data: sectors = [], isLoading: isLoadingSectors } = useQuery<Sector[], Error>({
        queryKey: ['sectors', selectedFarmId],
        queryFn: () => farmService.getSectorsByFarm(selectedFarmId!),
        enabled: !!selectedFarmId,
    });
    
    // 3. MANEJADORES DE CAMBIOS
    const handleFarmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const farmId = e.target.value ? Number(e.target.value) : undefined;
        setSelectedFarmId(farmId);
        setSelectedSectorId(undefined); // Resetear sector al cambiar de finca
        setIsFormOpen(false);
    };
    
    const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const sectorId = e.target.value ? Number(e.target.value) : undefined;
        setSelectedSectorId(sectorId);
        setIsFormOpen(false); // Ocultar formulario al cambiar de sector
    };

    const renderContent = () => {
        if (isLoadingFarms) return <p>Cargando fincas asignadas...</p>;
        if (farms.length === 0) {
            return (
                <div className="empty-state">
                    <h3>No tienes fincas asignadas</h3>
                    <p>Contacta a un administrador para que te asigne a una finca.</p>
                </div>
            );
        }

        return (
            <>
                {/* --- 4. FILTROS ACTUALIZADOS --- */}
                <div className="filters-bar">
                    <select onChange={handleFarmChange} value={selectedFarmId || ''}>
                        <option value="">Seleccione una finca...</option>
                        {farms.map(farm => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
                    </select>

                    <select onChange={handleSectorChange} value={selectedSectorId || ''} disabled={!selectedFarmId || isLoadingSectors}>
                        <option value="">{isLoadingSectors ? 'Cargando...' : 'Seleccione un sector...'}</option>
                        {sectors.map(sector => <option key={sector.id} value={sector.id}>{sector.name}</option>)}
                    </select>
                    
                    <button className="create-user-btn" onClick={() => setIsFormOpen(!isFormOpen)} disabled={!selectedSectorId}>
                        <i className={`fas ${isFormOpen ? 'fa-times' : 'fa-plus'}`}></i>
                        {isFormOpen ? 'Cancelar' : 'Registrar Aplicación'}
                    </button>
                </div>
                
                {isFormOpen && selectedFarmId && selectedSectorId && (
                    <FertilizationForm
                        farmId={selectedFarmId}
                        sectors={sectors.filter(s => s.id === selectedSectorId)}
                        onClose={() => setIsFormOpen(false)}
                    />
                )}

                {/* --- 5. RENDERIZADO CONDICIONAL DE LA LISTA --- */}
                {selectedSectorId && (
                    <FertilizationList sectorId={selectedSectorId} />
                )}

                {!selectedFarmId && (
                     <div className="empty-state">
                        <i className="fas fa-hand-pointer empty-icon"></i>
                        <h3>Seleccione una Finca</h3>
                        <p>Por favor, elija una finca y un sector para ver el historial y registrar aplicaciones.</p>
                    </div>
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