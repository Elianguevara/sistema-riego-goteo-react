// Archivo: src/components/tasks/TaskFilters.tsx

import React from 'react';
import type { Task, TaskType } from '../../types/task.types';
import './TaskFilters.css';

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
        <div className="task-filters-bar">
            <div className="filter-group">
                <i className="fas fa-search"></i>
                <input
                    type="text"
                    name="searchTerm"
                    placeholder="Buscar por descripción..."
                    value={filters.searchTerm}
                    onChange={handleInputChange}
                    className="search-input"
                />
            </div>
            <div className="filter-group">
                <i className="fas fa-cogs"></i>
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
            </div>
        </div>
    );
};

export default TaskFilters;