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
    const [formData, setFormData] = useState<Partial<TaskCreateData>>({
        taskType: 'RIEGO'
    });
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
            queryClient.invalidateQueries({ queryKey: ['tasksCreatedByMe'] });
            onClose();
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
        if (!formData.assignedToUserId || !formData.farmId) {
            toast.error("Por favor, asigna un operario y selecciona una finca.");
            return;
        }
        createTaskMutation.mutate(formData as TaskCreateData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container task-form-container">
                <h3>Crear Nueva Tarea</h3>
                <form onSubmit={handleSubmit}>
                    {/* --- INICIO DE LA MODIFICACIÓN: Nuevo flujo del formulario --- */}
                    <div className="form-group">
                        <label htmlFor="farmId">Paso 1: Seleccionar Finca</label>
                        <select name="farmId" onChange={handleFarmChange} required disabled={isLoadingFarms}>
                            <option value="">{isLoadingFarms ? 'Cargando...' : 'Seleccionar finca...'}</option>
                            {farms.map(farm => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
                        </select>
                    </div>

                    {/* El resto del formulario solo aparece si se ha seleccionado una finca */}
                    {selectedFarmId && (
                        <>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="taskType">Tipo de Tarea</label>
                                    <select name="taskType" value={formData.taskType} onChange={handleChange}>
                                        <option value="RIEGO">Riego</option>
                                        <option value="FERTILIZACION">Fertilización</option>
                                        <option value="MANTENIMIENTO">Mantenimiento</option>
                                        <option value="OTRO">Otro</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="assignedToUserId">Asignar a Operario</label>
                                    <select name="assignedToUserId" onChange={handleChange} required disabled={isLoadingUsers}>
                                        <option value="">{isLoadingUsers ? 'Cargando...' : 'Seleccionar operario...'}</option>
                                        {availableOperators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="sectorId">Sector (Opcional)</label>
                                    <select name="sectorId" onChange={handleChange} disabled={isLoadingSectors}>
                                        <option value="">{isLoadingSectors ? 'Cargando...' : 'Seleccionar sector...'}</option>
                                        {sectors.map(sector => <option key={sector.id} value={sector.id}>{sector.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Paso 2: Descripción de la Tarea</label>
                                <textarea id="description" name="description" onChange={handleChange} required />
                            </div>
                        </>
                    )}
                    {/* --- FIN DE LA MODIFICACIÓN --- */}

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={createTaskMutation.isPending}>Cancelar</button>
                        <button type="submit" className="btn-save" disabled={createTaskMutation.isPending || !selectedFarmId}>
                            {createTaskMutation.isPending ? 'Creando...' : 'Crear Tarea'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskForm;
