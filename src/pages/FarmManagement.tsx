// src/pages/FarmManagement.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import farmService from '../services/farmService';
import type { Farm, FarmCreateData, FarmUpdateData } from '../types/farm.types';
import FarmForm from '../components/farms/FarmForm';
import ActionsMenu, { type ActionMenuItem } from '../components/ui/ActionsMenu';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import FarmCard from '../components/farms/FarmCard';

const FarmManagement = () => {
    const queryClient = useQueryClient();
    
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [currentFarm, setCurrentFarm] = useState<Farm | null>(null);
    const [farmToDelete, setFarmToDelete] = useState<Farm | null>(null);

    const { data: farms = [], isLoading, isError, error } = useQuery<Farm[], Error>({
        queryKey: ['farms'],
        queryFn: farmService.getFarms,
    });

    // --- Mutaciones (sin cambios) ---
    const createFarmMutation = useMutation({
        mutationFn: farmService.createFarm,
        onSuccess: () => {
            toast.success('Finca creada exitosamente.');
            queryClient.invalidateQueries({ queryKey: ['farms'] });
            setIsFormModalOpen(false);
        },
        onError: (err: Error) => toast.error(err.message || 'Error al crear la finca.'),
    });

    const updateFarmMutation = useMutation({
        mutationFn: (variables: { id: number; data: FarmUpdateData }) => farmService.updateFarm(variables.id, variables.data),
        onSuccess: () => {
            toast.success('Finca actualizada exitosamente.');
            queryClient.invalidateQueries({ queryKey: ['farms'] });
            setIsFormModalOpen(false);
        },
        onError: (err: Error) => toast.error(err.message || 'Error al actualizar la finca.'),
    });

    const deleteFarmMutation = useMutation({
        mutationFn: farmService.deleteFarm,
        onSuccess: () => {
            toast.success('Finca eliminada exitosamente.');
            queryClient.invalidateQueries({ queryKey: ['farms'] });
            setFarmToDelete(null);
        },
        onError: (err: Error) => toast.error(err.message || 'Error al eliminar la finca.'),
    });

    // --- Manejadores de eventos (sin cambios) ---
    const handleOpenCreateForm = () => {
        setCurrentFarm(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditForm = (farm: Farm) => {
        setCurrentFarm(farm);
        setIsFormModalOpen(true);
    };

    const handleSaveForm = (data: FarmCreateData | FarmUpdateData) => {
        if (currentFarm) {
            updateFarmMutation.mutate({ id: currentFarm.id, data: data as FarmUpdateData });
        } else {
            createFarmMutation.mutate(data as FarmCreateData);
        }
    };

    const handleConfirmDelete = () => {
        if (farmToDelete) {
            deleteFarmMutation.mutate(farmToDelete.id);
        }
    };

    // --- Función de acciones simplificada ---
    const getFarmActions = (farm: Farm): ActionMenuItem[] => [
        {
            label: 'Editar Finca',
            action: () => handleOpenEditForm(farm),
        },
        {
            label: 'Eliminar Finca',
            action: () => setFarmToDelete(farm),
            className: 'delete',
        }
    ];

    if (isLoading) return <div className="user-management-page"><p>Cargando fincas...</p></div>;
    if (isError) return <div className="user-management-page"><p className="error-text">Error: {error.message}</p></div>;

    return (
        <div className="user-management-page">
            <div className="page-header">
                <h1>Fincas</h1>
                <button className="create-user-btn" onClick={handleOpenCreateForm}>
                    <i className="fas fa-plus"></i> Crear Finca
                </button>
            </div>

            <div className="farm-grid-container">
                {farms.map((farm) => (
                    <FarmCard 
                        key={farm.id} 
                        farm={farm} 
                        actions={getFarmActions(farm)}
                    />
                ))}
            </div>
            
            {isFormModalOpen && (
                 <div className="modal-overlay">
                    <FarmForm
                        currentFarm={currentFarm}
                        onSave={handleSaveForm}
                        onCancel={() => setIsFormModalOpen(false)}
                        isLoading={createFarmMutation.isPending || updateFarmMutation.isPending}
                    />
                </div>
            )}

            {farmToDelete && (
                <ConfirmationModal
                    message={`¿Estás seguro de que quieres eliminar la finca "${farmToDelete.name}"?`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setFarmToDelete(null)}
                    isLoading={deleteFarmMutation.isPending}
                />
            )}
        </div>
    );
};

export default FarmManagement;