import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import farmService from '../services/farmService';
import type { Farm, FarmCreateData, FarmUpdateData } from '../types/farm.types';
import FarmForm from '../components/farms/FarmForm';
// PASO 1: Importar el nuevo ActionsMenu genérico y su tipo
import ActionsMenu, { type ActionMenuItem } from '../components/ui/ActionsMenu';

// El modal de confirmación sigue siendo reutilizable y está bien como está
const ConfirmationModal = ({ message, onConfirm, onCancel, isLoading }: { message: string, onConfirm: () => void, onCancel: () => void, isLoading: boolean }) => (
    <div className="modal-overlay">
        <div className="modal-container">
            <h3>Confirmación Requerida</h3>
            <p>{message}</p>
            <div className="modal-actions">
                <button className="btn-cancel" onClick={onCancel} disabled={isLoading}>Cancelar</button>
                <button className="btn-delete" onClick={onConfirm} disabled={isLoading}>
                    {isLoading ? 'Eliminando...' : 'Confirmar'}
                </button>
            </div>
        </div>
    </div>
);

const FarmManagement = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    
    // --- Estados para modales (sin cambios) ---
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [currentFarm, setCurrentFarm] = useState<Farm | null>(null);
    const [farmToDelete, setFarmToDelete] = useState<Farm | null>(null);

    // --- Obtención y Mutaciones (sin cambios) ---
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

    // PASO 2: Definir las acciones específicas para las fincas
    const getFarmActions = (farm: Farm): ActionMenuItem[] => [
        {
            label: 'Editar Finca',
            action: () => handleOpenEditForm(farm),
        },
        {
            label: 'Eliminar Finca',
            action: () => setFarmToDelete(farm),
            className: 'delete', // Clase para estilizar el botón de eliminar
        }
    ];

    // --- Renderizado ---
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

            <div className="user-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Ubicación</th>
                            <th>Capacidad Reserva (L)</th>
                            <th>Tamaño (ha)</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {farms.map((farm) => (
                            <tr key={farm.id}>
                                <td>{farm.name}</td>
                                <td>{farm.location}</td>
                                <td>{farm.reservoirCapacity.toLocaleString('es-AR')}</td>
                                <td>{farm.farmSize.toLocaleString('es-AR')}</td>
                                <td className="actions">
                                    <button className="btn-secondary" onClick={() => navigate(`/farms/${farm.id}`)}>
                                        Ver Detalles
                                    </button>
                                    {/* PASO 3: Usar el nuevo componente ActionsMenu */}
                                    <ActionsMenu items={getFarmActions(farm)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
