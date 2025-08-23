// Archivo: src/pages/operator/MyTasks.tsx

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import taskService from '../../services/taskService';
import type { Task, TaskStatus } from '../../types/task.types';
import './MyTasks.css';

// --- VERSIÓN MEJORADA Y FINAL DEL COMPONENTE TaskCard ---
const TaskCard = ({ task, onUpdateStatus }: { task: Task, onUpdateStatus: (taskId: number, status: TaskStatus) => void }) => {

    const getIconClass = (taskType: string) => {
        switch (taskType) {
            case 'RIEGO': return 'fas fa-tint';
            case 'MANTENIMIENTO': return 'fas fa-tools';
            case 'FERTILIZACION': return 'fas fa-vial';
            default: return 'fas fa-clipboard-list';
        }
    };

    const handleStatusChange = (newStatus: TaskStatus) => {
        if (task.status !== newStatus) {
            onUpdateStatus(task.id, newStatus);
        }
    };

    if (!task || !task.status) {
        return null;
    }

    return (
        <div className={`task-card status-${task.status.toLowerCase()}`}>
            <div className="task-card-header">
                <div className="task-title">
                    <i className={`${getIconClass(task.taskType)} task-icon`}></i>
                    <span className="task-type">{task.taskType?.replace('_', ' ') || 'Tarea'}</span>
                </div>
                <div className={`task-status-badge status-${task.status.toLowerCase()}`}>
                    {task.status.replace('_', ' ')}
                </div>
            </div>

            <div className="task-details">
                <div className="task-location">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>
                        {task.farmName
                            ? `${task.farmName} ${task.sectorName ? `> ${task.sectorName}` : ''}`
                            : 'Ubicación no especificada'
                        }
                    </span>
                </div>
                <p className="task-description">{task.description}</p>
            </div>

            <div className="task-card-footer">
                <div className="task-actions">
                    {task.status === 'PENDIENTE' && (
                        <button className="btn-start" onClick={() => handleStatusChange('EN_PROGRESO')}>
                            <i className="fas fa-play"></i> Iniciar
                        </button>
                    )}
                    {task.status === 'EN_PROGRESO' && (
                        <button className="btn-complete" onClick={() => handleStatusChange('COMPLETADA')}>
                            <i className="fas fa-check-circle"></i> Completar
                        </button>
                    )}
                </div>
                 <span className="task-date">Creada: {new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    );
};
// --- FIN DEL COMPONENTE TaskCard ---


const MyTasks = () => {
    const queryClient = useQueryClient();
    const queryKey = ['myTasks'];

    const { data: tasks, isLoading, isError, error } = useQuery<Task[], Error>({
        queryKey,
        queryFn: taskService.getMyTasks,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ taskId, status }: { taskId: number, status: TaskStatus }) =>
            taskService.updateTaskStatus(taskId, { status }),
        onSuccess: () => {
            toast.success("Estado de la tarea actualizado.");
            queryClient.invalidateQueries({ queryKey });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleUpdateStatus = (taskId: number, status: TaskStatus) => {
        updateStatusMutation.mutate({ taskId, status });
    };

    if (isLoading) return <div className="tasks-page"><p>Cargando tareas...</p></div>;
    if (isError) return <div className="tasks-page"><p className="error-text">Error: {error.message}</p></div>;

    if (!Array.isArray(tasks)) {
        return (
            <div className="tasks-page">
                <h1>Mis Tareas Asignadas</h1>
                <p>No se pudieron cargar las tareas o no tienes tareas asignadas en este momento.</p>
            </div>
        );
    }

    const pendingTasks = tasks.filter(t => t.status === 'PENDIENTE');
    const inProgressTasks = tasks.filter(t => t.status === 'EN_PROGRESO');
    const completedTasks = tasks.filter(t => t.status === 'COMPLETADA');

    return (
        <div className="tasks-page">
            <h1>Mis Tareas Asignadas</h1>
            <div className="tasks-columns">
                <div className="task-column">
                    <h2><i className="fas fa-hourglass-start"></i> Pendientes</h2>
                    {pendingTasks.length > 0 ? pendingTasks.map(task => (
                        <TaskCard key={task.id} task={task} onUpdateStatus={handleUpdateStatus} />
                    )) : <p>No hay tareas pendientes.</p>}
                </div>
                <div className="task-column">
                    <h2><i className="fas fa-cogs"></i> En Progreso</h2>
                    {inProgressTasks.length > 0 ? inProgressTasks.map(task => (
                        <TaskCard key={task.id} task={task} onUpdateStatus={handleUpdateStatus} />
                    )) : <p>No hay tareas en progreso.</p>}
                </div>
                <div className="task-column">
                    <h2><i className="fas fa-check-double"></i> Completadas</h2>
                    {completedTasks.length > 0 ? completedTasks.map(task => (
                        <TaskCard key={task.id} task={task} onUpdateStatus={handleUpdateStatus} />
                    )) : <p>No hay tareas completadas.</p>}
                </div>
            </div>
        </div>
    );
};

export default MyTasks;