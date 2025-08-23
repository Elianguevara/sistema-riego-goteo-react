// Archivo: src/components/tasks/TaskForm.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import taskService from '../../services/taskService';
import farmService from '../../services/farmService';
import type { TaskCreateData } from '../../types/task.types';
import type { Farm, Sector } from '../../types/farm.types';
import type { UserResponse } from '../../types/user.types';
import './TaskForm.css';

interface TaskFormProps {
    onClose: () => void;
}

const TaskForm = ({ onClose }: TaskFormProps) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<Partial<TaskCreateData>>({});
    const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>();

    const { data: farms = [], isLoading: isLoadingFarms } = useQuery<Farm[], Error>({
        queryKey: ['farms'],
        queryFn: farmService.getFarms
    });

    const { data: sectors = [], isLoading: isLoadingSectors } = useQuery<Sector[], Error>({
        queryKey: ['sectors', selectedFarmId],
        queryFn: () => farmService.getSectorsByFarm(selectedFarmId!),
        enabled: !!selectedFarmId,
    });

    const { data: assignedUsers = [], isLoading: isLoadingUsers } = useQuery<UserResponse[], Error>({
        queryKey: ['assignedUsers', selectedFarmId],
        queryFn: () => farmService.getAssignedUsers(selectedFarmId!),
        enabled: !!selectedFarmId,
    });

    const availableOperators = assignedUsers.filter(user => user.roleName === 'OPERARIO' && user.active);

    const createTaskMutation = useMutation({
        mutationFn: taskService.createTask,
        onSuccess: () => {
            toast.success("Tarea creada y asignada exitosamente.");
            // Invalida la lista de tareas del analista (para que vea su nueva tarea creada)
            queryClient.invalidateQueries({ queryKey: ['tasksCreatedByMe'] });
            
            // --- ¡ESTA ES LA LÍNEA CLAVE DE LA SOLUCIÓN! ---
            // También invalida la lista de tareas del operario.
            queryClient.invalidateQueries({ queryKey: ['myTasks'] });

            onClose();
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const parsedValue = ['farmId', 'sectorId', 'assignedToUserId'].includes(name) ? parseInt(value) : value;
        setFormData(prev => ({ ...prev, [name]: parsedValue }));
    };

    const handleFarmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const farmId = e.target.value ? Number(e.target.value) : undefined;
        setSelectedFarmId(farmId);
        setFormData(prev => ({
            ...prev,
            farmId,
            sectorId: undefined,
            assignedToUserId: undefined
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description || !formData.assignedToUserId || !formData.sectorId) {
            toast.error("Por favor, completa la descripción y selecciona finca, operario y sector.");
            return;
        }
        createTaskMutation.mutate(formData as TaskCreateData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container task-form-container">
                <h3>Crear Nueva Tarea</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Paso 1: Seleccionar Ubicación y Responsable</label>
                        <div className='form-grid'>
                            <select name="farmId" onChange={handleFarmChange} required>
                                <option value="">{isLoadingFarms ? 'Cargando fincas...' : 'Seleccionar finca...'}</option>
                                {farms.map(farm => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
                            </select>
                            <select name="sectorId" onChange={handleChange} required disabled={!selectedFarmId || isLoadingSectors}>
                                <option value="">{isLoadingSectors ? 'Cargando...' : 'Seleccionar sector...'}</option>
                                {sectors.map(sector => <option key={sector.id} value={sector.id}>{sector.name}</option>)}
                            </select>
                            <select name="assignedToUserId" onChange={handleChange} required disabled={!selectedFarmId || isLoadingUsers}>
                                <option value="">{isLoadingUsers ? 'Cargando...' : 'Asignar a operario...'}</option>
                                {availableOperators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="description">Paso 2: Descripción de la Tarea</label>
                        <textarea id="description" name="description" onChange={handleChange} required placeholder='Ej: Revisar el sistema de goteo y limpiar filtros...' />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={createTaskMutation.isPending}>Cancelar</button>
                        <button type="submit" className="btn-save" disabled={createTaskMutation.isPending}>
                            {createTaskMutation.isPending ? 'Creando...' : 'Crear Tarea'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskForm;