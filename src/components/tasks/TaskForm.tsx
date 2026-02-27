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
import Modal from '../ui/Modal';

interface TaskFormProps {
    onClose: () => void;
}

const TaskForm = ({ onClose }: TaskFormProps) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<Partial<TaskCreateData>>({});
    const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>();

    // --- QUERIES PARA OBTENER DATOS ---

    const { data: farms = [], isLoading: isLoadingFarms } = useQuery<Farm[], Error>({
        queryKey: ['farms'],
        queryFn: farmService.getFarms
    });

    const { data: sectors = [], isLoading: isLoadingSectors } = useQuery<Sector[], Error>({
        queryKey: ['sectors', selectedFarmId],
        queryFn: () => farmService.getSectorsByFarm(selectedFarmId!),
        enabled: !!selectedFarmId,
    });
    
    // --- LÓGICA CORREGIDA PARA OBTENER OPERARIOS ---
    const { data: assignedUsers = [], isLoading: isLoadingUsers } = useQuery<UserResponse[], Error>({
        queryKey: ['assignedUsers', selectedFarmId],
        queryFn: () => farmService.getAssignedUsers(selectedFarmId!),
        enabled: !!selectedFarmId, // Solo se ejecuta si hay una finca seleccionada
    });
    // Filtramos para obtener solo los operarios activos de la finca seleccionada
    const availableOperators = assignedUsers.filter(user => user.roleName === 'OPERARIO' && user.active);


    const createTaskMutation = useMutation({
        mutationFn: taskService.createTask,
        onSuccess: () => {
            toast.success("Tarea creada y asignada exitosamente.");
            queryClient.invalidateQueries({ queryKey: ['tasksCreatedByMe'] });
            queryClient.invalidateQueries({ queryKey: ['myTasks'] });
            queryClient.invalidateQueries({ queryKey: ['analystTaskSummary'] });
            onClose();
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const parsedValue = ['sectorId', 'assignedToUserId'].includes(name) ? parseInt(value) : value;
        setFormData(prev => ({ ...prev, [name]: parsedValue }));
    };

    const handleFarmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const farmId = e.target.value ? Number(e.target.value) : undefined;
        setSelectedFarmId(farmId);
        setFormData(prev => ({
            ...prev,
            sectorId: undefined,
            assignedToUserId: undefined
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description || !formData.assignedToUserId || !formData.sectorId || !selectedFarmId) {
            toast.error("Por favor, completa todos los campos.");
            return;
        }
        createTaskMutation.mutate(formData as TaskCreateData);
    };

    return (
        <Modal isOpen={true} onClose={onClose} size="lg" className="task-form-container">
                <h3>Crear Nueva Tarea</h3>
                <form onSubmit={handleSubmit}>
                    <div className="task-form-step">
                        <h4 className="step-header">
                            <span className="step-number">1</span>
                            Definir Ubicación y Responsable
                        </h4>
                        <div className="step-content">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="farmId">Finca</label>
                                    <select id="farmId" name="farmId" onChange={handleFarmChange} value={selectedFarmId || ''} required>
                                        <option value="" disabled>{isLoadingFarms ? 'Cargando...' : 'Seleccionar...'}</option>
                                        {farms.map(farm => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="sectorId">Sector</label>
                                    <select id="sectorId" name="sectorId" onChange={handleChange} value={formData.sectorId || ''} required disabled={!selectedFarmId || isLoadingSectors}>
                                        <option value="" disabled>{isLoadingSectors ? 'Cargando...' : 'Seleccionar...'}</option>
                                        {sectors.map(sector => <option key={sector.id} value={sector.id}>{sector.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="assignedToUserId">Asignar a</label>
                                    <select id="assignedToUserId" name="assignedToUserId" onChange={handleChange} value={formData.assignedToUserId || ''} required disabled={!selectedFarmId || isLoadingUsers}>
                                        <option value="" disabled>{isLoadingUsers ? 'Cargando...' : 'Seleccionar operario...'}</option>
                                        {availableOperators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="task-form-step">
                        <h4 className="step-header">
                            <span className="step-number">2</span>
                            Detallar la Tarea
                        </h4>
                        <div className="step-content">
                            <div className="form-group">
                                <label htmlFor="description">Descripción de la Tarea</label>
                                <textarea id="description" name="description" onChange={handleChange} required placeholder='Ej: Revisar el sistema de goteo del Sector Malbec y limpiar filtros...' />
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={createTaskMutation.isPending}>Cancelar</button>
                        <button type="submit" className="btn-save" disabled={createTaskMutation.isPending}>
                            {createTaskMutation.isPending ? 'Creando...' : 'Crear Tarea'}
                        </button>
                    </div>
                </form>
        </Modal>
    );
};

export default TaskForm;
