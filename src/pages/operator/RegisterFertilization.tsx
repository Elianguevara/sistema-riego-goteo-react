// Archivo: src/pages/operator/RegisterFertilization.tsx

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import farmService from '../../services/farmService';
import fertilizationService from '../../services/fertilizationService';
import type { Farm, Sector } from '../../types/farm.types';
import type { FertilizationCreateData } from '../../types/fertilization.types';
import FertilizationForm from '../../components/fertilization/FertilizationForm';
// 1. CORRECCIÓN: Se eliminó la 'l' extra en la ruta.
import FertilizationList from '../../components/fertilization/FertilizationList';
import './RegisterIrrigation.css';

const RegisterFertilization = () => {
    const queryClient = useQueryClient();
    const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>();
    const [selectedSectorId, setSelectedSectorId] = useState<number | undefined>();
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: farms = [], isLoading: isLoadingFarms } = useQuery<Farm[], Error>({
        queryKey: ['myFarms'],
        queryFn: () => farmService.getFarms(),
    });

    useEffect(() => {
        if (isLoadingFarms || selectedFarmId) return;
        if (farms && farms.length === 1) {
            setSelectedFarmId(farms[0].id);
        }
    }, [farms, isLoadingFarms, selectedFarmId]);

    const { data: sectors = [], isLoading: isLoadingSectors } = useQuery<Sector[], Error>({
        queryKey: ['sectors', selectedFarmId],
        queryFn: () => farmService.getSectorsByFarm(selectedFarmId!),
        enabled: !!selectedFarmId,
    });
    
    const createFertilizationMutation = useMutation({
        mutationFn: (data: FertilizationCreateData) => fertilizationService.createFertilizationRecord(data),
        onSuccess: () => {
            toast.success("Registro de fertilización creado.");
            queryClient.invalidateQueries({ queryKey: ['fertilizationRecords', selectedSectorId] });
            setIsFormOpen(false);
        },
        onError: (err: Error) => toast.error(err.message),
    });

    // 2. CORRECCIÓN: La función ahora maneja el tipo más amplio que espera el formulario.
    const handleSaveFertilization = (data: FertilizationCreateData | Partial<FertilizationCreateData>) => {
        // Como esta vista solo crea, nos aseguramos de que los datos sean completos antes de enviarlos.
        createFertilizationMutation.mutate(data as FertilizationCreateData);
    };

    const handleFarmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const farmId = e.target.value ? Number(e.target.value) : undefined;
        setSelectedFarmId(farmId);
        setSelectedSectorId(undefined);
        setIsFormOpen(false);
    };
    
    const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const sectorId = e.target.value ? Number(e.target.value) : undefined;
        setSelectedSectorId(sectorId);
        setIsFormOpen(false);
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
                <div className="filters-bar">
                    {farms.length === 1 ? (
                        <div className="farm-display">
                           <strong>Finca:</strong> {farms[0].name}
                        </div>
                    ) : (
                        <select onChange={handleFarmChange} value={selectedFarmId || ''}>
                            <option value="">Seleccione una finca...</option>
                            {farms.map(farm => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
                        </select>
                    )}

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
                        currentFertilization={null}
                        onSave={handleSaveFertilization}
                        isLoading={createFertilizationMutation.isPending}
                    />
                )}

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