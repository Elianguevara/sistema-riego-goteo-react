// Archivo: src/pages/analyst/TaskManagement.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import taskService, { type TaskFilters } from '../../services/taskService';
import farmService from '../../services/farmService';
import adminService from '../../services/adminService';
import dashboardService from '../../services/dashboardService';
import type { Task, TaskPriority, TaskStatus } from '../../types/task.types';
import type { Farm } from '../../types/farm.types';
import TaskForm from '../../components/tasks/TaskForm';
import TaskDetailModal from '../../components/tasks/TaskDetailModal';
import { CheckCircle, Clock, XCircle, AlertCircle, Plus, Filter, User, MapPin, Calendar, MoreVertical } from 'lucide-react';
import './TaskManagement.css';

// --- COMPONENTES INTERNOS ---

const TaskCard = ({ task, onSelectTask, onShowActions }: { task: Task, onSelectTask: (task: Task) => void, onShowActions: (task: Task) => void }) => {
    const getStatusConfig = (status: TaskStatus) => {
        const configs = {
            PENDIENTE: { color: '#3b82f6', bg: '#eff6ff', icon: Clock, label: 'Pendiente', border: '#3b82f6' },
            EN_PROGRESO: { color: '#f59e0b', bg: '#fffbeb', icon: AlertCircle, label: 'En Progreso', border: '#f59e0b' },
            COMPLETADA: { color: '#10b981', bg: '#f0fdf4', icon: CheckCircle, label: 'Completada', border: '#10b981' },
            CANCELADA: { color: '#ef4444', bg: '#fef2f2', icon: XCircle, label: 'Cancelada', border: '#ef4444' }
        };
        return configs[status] || configs.PENDIENTE;
    };

    const getPriorityBadge = (priority: TaskPriority) => {
        const configs = {
            ALTA: { bg: '#fef2f2', color: '#991b1b', label: '🔴 Alta' },
            MEDIA: { bg: '#fffbeb', color: '#92400e', label: '🟡 Media' },
            BAJA: { bg: '#f0fdf4', color: '#166534', label: '🟢 Baja' }
        };
        return configs[priority] || configs.MEDIA;
    };

    const statusConfig = getStatusConfig(task.status);
    const priorityConfig = getPriorityBadge(task.priority);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="task-card-new" style={{ '--border-color': statusConfig.border } as React.CSSProperties} onClick={() => onSelectTask(task)}>
            <div className="task-card-header">
                <div className="status-badge" style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}>
                    <StatusIcon size={16} />
                    <span>{statusConfig.label}</span>
                </div>
                <div className="priority-badge" style={{ backgroundColor: priorityConfig.bg, color: priorityConfig.color }}>
                    {priorityConfig.label}
                </div>
            </div>

            <div className="task-card-body">
                <p className="task-description">{task.description}</p>
                <div className="task-meta">
                    <div className="meta-item"><User size={14} /> Asignada a: <strong>{task.assignedToUsername}</strong></div>
                    <div className="meta-item"><MapPin size={14} /> <strong>{task.farmName}</strong> › {task.sectorName || 'N/A'}</div>
                </div>
            </div>

            <div className="task-card-footer">
                <div className="creation-date"><Calendar size={12} /> Creada: {new Date(task.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</div>
                <button className="actions-button" onClick={(e) => { e.stopPropagation(); onShowActions(task); }}>
                    <MoreVertical size={16} />
                </button>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---

const TaskManagement = () => {
    const [filters, setFilters] = useState<TaskFilters>({ status: 'TODOS' });
    const [showFilters, setShowFilters] = useState(true);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // --- QUERIES ---
    const { data: tasks = [] } = useQuery<Task[], Error>({
        queryKey: ['tasksCreatedByMe', filters],
        queryFn: () => taskService.getTasksCreatedByMe(filters),
    });

    const { data: taskSummary } = useQuery({
        queryKey: ['analystTaskSummary'],
        queryFn: dashboardService.getTaskSummary,
    });

    const { data: farms = [] } = useQuery<Farm[], Error>({ queryKey: ['farms'], queryFn: farmService.getFarms });
    const { data: usersPage } = useQuery({ queryKey: ['allUsers'], queryFn: () => adminService.getUsers({ size: 1000 }) });
    const operators = usersPage?.content.filter(u => u.roleName === 'OPERARIO') || [];

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleShowActions = (task: Task) => {
        toast.info(`Mostrando acciones para la tarea #${task.id}`);
        // Aquí puedes implementar un menú contextual si lo deseas
    };

    return (
        <div className="task-management-container">
            <header className="page-header-tasks">
                <div>
                    <h1><CheckCircle size={32} color="#3b82f6" /> Gestión de Tareas</h1>
                    <p>Administra y monitorea todas las tareas asignadas</p>
                </div>
                <div className="header-actions">
                    <button className="header-btn" onClick={() => setShowFilters(!showFilters)}>
                        <Filter size={18} /> {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
                    </button>
                    <button className="header-btn primary" onClick={() => setIsFormOpen(true)}>
                        <Plus size={18} /> Crear Tarea
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="kpi-grid-tasks">
                <div className="kpi-card-tasks" style={{'--border-color': '#6b7280'} as React.CSSProperties}><p>Total de Tareas</p><h3>{taskSummary?.totalTasks ?? 0}</h3></div>
                <div className="kpi-card-tasks" style={{'--border-color': '#3b82f6'} as React.CSSProperties}><p>Pendientes</p><h3>{taskSummary?.pendingTasks ?? 0}</h3></div>
                <div className="kpi-card-tasks" style={{'--border-color': '#f59e0b'} as React.CSSProperties}><p>En Progreso</p><h3>{taskSummary?.inProgressTasks ?? 0}</h3></div>
                <div className="kpi-card-tasks" style={{'--border-color': '#10b981'} as React.CSSProperties}><p>Completadas</p><h3>{taskSummary?.completedTasks ?? 0}</h3></div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="filters-panel-tasks">
                    <div className="filter-item-tasks"><label>Estado</label><select name="status" value={filters.status} onChange={handleFilterChange}><option value="TODOS">Todos</option><option value="PENDIENTE">Pendiente</option><option value="EN_PROGRESO">En Progreso</option><option value="COMPLETADA">Completada</option><option value="CANCELADA">Cancelada</option></select></div>
                    <div className="filter-item-tasks"><label>Finca</label><select name="farmId" value={filters.farmId} onChange={handleFilterChange}><option value="TODAS">Todas</option>{farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
                    <div className="filter-item-tasks"><label>Operario</label><select name="assignedToUserId" value={filters.assignedToUserId} onChange={handleFilterChange}><option value="TODAS">Todos</option>{operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}</select></div>
                </div>
            )}
            
            {/* Task Grid */}
            <div className="tasks-grid">
                {tasks.length > 0 ? (
                    tasks.map(task => <TaskCard key={task.id} task={task} onSelectTask={setSelectedTask} onShowActions={handleShowActions} />)
                ) : (
                    <div className="empty-state-tasks"><AlertCircle size={48} color="#9ca3af" /><h3>No se encontraron tareas</h3><p>No hay tareas que coincidan con los filtros seleccionados.</p></div>
                )}
            </div>

            {/* Modals */}
            {isFormOpen && <TaskForm onClose={() => setIsFormOpen(false)} />}
            {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
        </div>
    );
};

export default TaskManagement;