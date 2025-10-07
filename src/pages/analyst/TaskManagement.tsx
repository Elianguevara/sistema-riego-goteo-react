// Archivo: src/pages/analyst/TaskManagement.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import taskService, { type TaskFilters } from '../../services/taskService';
import farmService from '../../services/farmService';
import adminService from '../../services/adminService';
import type { Task } from '../../types/task.types';
import type { Farm } from '../../types/farm.types';
import type { UserResponse } from '../../types/user.types';
import TaskForm from '../../components/tasks/TaskForm';
import TaskDetailModal from '../../components/tasks/TaskDetailModal';
import ActionsMenu, { type ActionMenuItem } from '../../components/ui/ActionsMenu';
import './TaskManagement.css';

// --- COMPONENTE PARA LA TARJETA DE TAREA ---
const TaskCard = ({ task, onSelect }: { task: Task, onSelect: (task: Task) => void }) => {
    const getStatusClass = (status: string) => `status-${status.toLowerCase()}`;
    
    const taskActions: ActionMenuItem[] = [
        { label: "Ver Detalles", action: () => onSelect(task) },
        { label: "Editar Tarea", action: () => alert(`Editando: ${task.id}`) },
        { label: "Cancelar Tarea", action: () => alert(`Cancelando: ${task.id}`), className: 'delete' }
    ];

    return (
        <div className={`task-card-analyst ${getStatusClass(task.status)}`}>
            <div className="task-card-analyst-header">
                <span className={`task-status-badge ${getStatusClass(task.status)}`}>
                    {task.status.replace('_', ' ')}
                </span>
                <ActionsMenu items={taskActions} />
            </div>
            <div className="task-card-analyst-body">
                <p>{task.description}</p>
                <div className="task-meta-item">
                    <i className="fas fa-user"></i>
                    <span>Asignada a: <strong>{task.assignedToUsername}</strong></span>
                </div>
                <div className="task-meta-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>Ubicación: <strong>{task.farmName} &gt; {task.sectorName || 'N/A'}</strong></span>
                </div>
            </div>
            <div className="task-card-analyst-footer">
                Creada: {new Date(task.createdAt).toLocaleDateString()}
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
const TaskManagement = () => {
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [filters, setFilters] = useState<TaskFilters>({ status: 'TODOS' });

    // --- QUERIES PARA LOS DATOS ---
    const { data: tasks = [], isLoading: isLoadingTasks } = useQuery<Task[], Error>({
        queryKey: ['tasksCreatedByMe', filters],
        queryFn: () => taskService.getTasksCreatedByMe(filters),
    });
    const { data: farms = [] } = useQuery<Farm[], Error>({ queryKey: ['farms'], queryFn: farmService.getFarms });
    const { data: usersPage } = useQuery({ queryKey: ['allUsers'], queryFn: () => adminService.getUsers({ size: 1000 }) });
    const operators = usersPage?.content.filter(u => u.roleName === 'OPERARIO') || [];

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="task-management-page">
            <div className="page-header">
                <h1>Gestión de Tareas</h1>
                <button className="create-task-btn" onClick={() => setIsFormModalOpen(true)}>
                    <i className="fas fa-plus"></i> Crear Tarea
                </button>
            </div>

            {/* --- Filtros --- */}
            <div className="task-filters-container">
                <div className="filter-item">
                    <label>Filtrar por Estado</label>
                    <select name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="TODOS">Todos</option>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="EN_PROGRESO">En Progreso</option>
                        <option value="COMPLETADA">Completada</option>
                        <option value="CANCELADA">Cancelada</option>
                    </select>
                </div>
                <div className="filter-item">
                    <label>Filtrar por Finca</label>
                    <select name="farmId" value={filters.farmId} onChange={handleFilterChange}>
                        <option value="TODAS">Todas</option>
                        {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                </div>
                <div className="filter-item">
                    <label>Filtrar por Operario</label>
                    <select name="assignedToUserId" value={filters.assignedToUserId} onChange={handleFilterChange}>
                        <option value="TODAS">Todos</option>
                        {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                    </select>
                </div>
            </div>

            {/* --- Lista de Tareas --- */}
            {isLoadingTasks ? <p>Cargando tareas...</p> : (
                <div className="task-list-container">
                    {tasks.length > 0 ? (
                        tasks.map(task => <TaskCard key={task.id} task={task} onSelect={setSelectedTask} />)
                    ) : (
                        <div className="empty-state">No se encontraron tareas con los filtros seleccionados.</div>
                    )}
                </div>
            )}

            {/* --- Modales --- */}
            {isFormModalOpen && <TaskForm onClose={() => setIsFormModalOpen(false)} />}
            {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
        </div>
    );
};

export default TaskManagement;