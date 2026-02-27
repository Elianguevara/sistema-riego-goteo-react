// src/pages/FarmManagement.tsx

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import farmService from '../services/farmService';
import type { Farm, FarmCreateData, FarmUpdateData } from '../types/farm.types';
import FarmManagementView from './FarmManagementView';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';

const FarmManagement = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [currentFarm, setCurrentFarm] = useState<Farm | null>(null);
    const [farmToDelete, setFarmToDelete] = useState<Farm | null>(null);

    const { data: farms = [], isLoading, isError, error } = useQuery<Farm[], Error>({
        queryKey: ['farms'],
        queryFn: farmService.getFarms,
    });

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
        mutationFn: (variables: { id: number; data: FarmUpdateData }) =>
            farmService.updateFarm(variables.id, variables.data),
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

    const handleOpenCreateForm = () => { setCurrentFarm(null); setIsFormModalOpen(true); };
    const handleOpenEditForm = (farm: Farm) => { setCurrentFarm(farm); setIsFormModalOpen(true); };

    const handleSaveForm = (data: FarmCreateData | FarmUpdateData) => {
        if (currentFarm) {
            updateFarmMutation.mutate({ id: currentFarm.id, data: data as FarmUpdateData });
        } else {
            createFarmMutation.mutate(data as FarmCreateData);
        }
    };

    const handleConfirmDelete = () => {
        if (farmToDelete) { deleteFarmMutation.mutate(farmToDelete.id); }
    };

    const filteredFarms = useMemo(() => farms.filter(farm =>
        farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farm.location.toLowerCase().includes(searchTerm.toLowerCase())
    ), [farms, searchTerm]);

    const stats = useMemo(() => ({
        totalFarms: farms.length,
        activeFarms: farms.length,
        totalArea: farms.reduce((sum, f) => sum + f.farmSize, 0),
    }), [farms]);

    if (isLoading) return <LoadingState message="Cargando fincas..." />;
    if (isError) return <ErrorState message={error.message} />;

    return (
        <FarmManagementView
            filteredFarms={filteredFarms}
            stats={stats}
            searchTerm={searchTerm}
            viewMode={viewMode}
            isFormModalOpen={isFormModalOpen}
            currentFarm={currentFarm}
            farmToDelete={farmToDelete}
            isFormSaving={createFarmMutation.isPending || updateFarmMutation.isPending}
            isDeleting={deleteFarmMutation.isPending}
            onSearchChange={setSearchTerm}
            onViewModeChange={setViewMode}
            onOpenCreateForm={handleOpenCreateForm}
            onOpenEditForm={handleOpenEditForm}
            onSaveForm={handleSaveForm}
            onCloseFormModal={() => setIsFormModalOpen(false)}
            onOpenDeleteModal={setFarmToDelete}
            onCloseDeleteModal={() => setFarmToDelete(null)}
            onConfirmDelete={handleConfirmDelete}
            onNavigateToFarm={(id) => navigate(`/farms/${id}`)}
        />
    );
};

export default FarmManagement;
