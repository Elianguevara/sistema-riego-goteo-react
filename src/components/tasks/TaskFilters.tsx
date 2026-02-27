// Archivo: src/components/tasks/TaskFilters.tsx

import React from 'react';
import type { Task, TaskType } from '../../types/task.types';
import './TaskFilters.css';
import TableToolbar from '../ui/TableToolbar';

// Definimos los tipos para los filtros que el usuario puede aplicar
export interface TaskFiltersState {
    searchTerm: string;
    taskType: TaskType | 'TODAS';
}

interface Props {
    filters: TaskFiltersState;
    onFilterChange: (filters: TaskFiltersState) => void;
    tasks: Task[]; // Se necesita para obtener opciones dinámicas, como las fincas
}

const TaskFilters = ({ filters, onFilterChange, tasks }: Props) => {
    // Obtenemos los tipos de tarea únicos de las tareas existentes para el filtro
    const availableTaskTypes = Array.from(new Set(tasks.map(t => t.taskType)));

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onFilterChange({
            ...filters,
            [name]: value,
        });
    };

    return (
        <TableToolbar
            searchValue={filters.searchTerm}
            onSearchChange={(value) => onFilterChange({ ...filters, searchTerm: value })}
            searchPlaceholder="Buscar por descripción..."
        >
            <select
                name="taskType"
                value={filters.taskType}
                onChange={handleInputChange}
                className="filter-select"
            >
                <option value="TODAS">Todos los tipos</option>
                {availableTaskTypes.map(type => (
                    <option key={type} value={type}>{type.replace('_', ' ')}</option>
                ))}
            </select>
        </TableToolbar>
    );
};

export default TaskFilters;