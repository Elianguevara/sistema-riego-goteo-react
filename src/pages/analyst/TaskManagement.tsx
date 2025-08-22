// Archivo: src/pages/analyst/TaskManagement.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import taskService from '../../services/taskService';
import type { Task } from '../../types/task.types';
import TaskForm from '../../components/tasks/TaskForm';
import './TaskManagement.css';

const TaskManagement = () => {
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    // Obtener las tareas creadas por el analista
    const { data: tasks = [], isLoading: isLoadingTasks, isError, error } = useQuery<Task[], Error>({
        queryKey: ['tasksCreatedByMe'],
        queryFn: taskService.getTasksCreatedByMe,
    });

    if (isError) return <div className="task-management-page"><p className="error-text">Error: {error.message}</p></div>;

    return (
        <div className="task-management-page">
            <div className="page-header">
                <h1>Gestión de Tareas</h1>
                <button className="create-task-btn" onClick={() => setIsFormModalOpen(true)}>
                    <i className="fas fa-plus"></i> Crear Tarea
                </button>
            </div>

            <div className="task-table-container">
                {isLoadingTasks ? <p>Cargando tareas...</p> : (
                    <table>
                        <thead>
                            <tr>
                                <th>Descripción</th>
                                <th>Tipo</th>
                                <th>Estado</th>
                                <th>Finca</th>
                                <th>Sector</th>
                                <th>Fecha Creación</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map(task => (
                                <tr key={task.id}>
                                    <td>{task.description}</td>
                                    <td>{task.taskType}</td>
                                    <td>
                                        <span className={`task-status-badge status-${task.status.toLowerCase()}`}>
                                            {task.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>{task.farmName}</td>
                                    <td>{task.sectorName || 'N/A'}</td>
                                    <td>{new Date(task.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {isFormModalOpen && (
                <TaskForm onClose={() => setIsFormModalOpen(false)} />
            )}
        </div>
    );
};

export default TaskManagement;
