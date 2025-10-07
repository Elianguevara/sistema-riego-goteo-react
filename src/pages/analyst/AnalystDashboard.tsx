// Archivo: src/pages/analyst/AnalystDashboard.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import farmService from '../../services/farmService';
import type { FarmStatus, WaterBalance, TaskSummary } from '../../types/analyst.types';
import type { Farm } from '../../types/farm.types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import 'leaflet/dist/leaflet.css';
import { TrendingUp, Clock, AlertCircle, CheckCircle, Calendar, MapPin } from 'lucide-react';
import './AnalystDashboard.css';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="tooltip-label">{new Date(label).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="tooltip-item" style={{ color: entry.color }}>
                        {entry.name}: <strong>{entry.value}</strong>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const AnalystDashboard = () => {
    const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>();

    const { data: farms = [] } = useQuery<Farm[], Error>({
        queryKey: ['farmsForAnalyst'],
        queryFn: farmService.getFarms,
    });

    useState(() => {
        if (farms.length > 0 && !selectedFarmId) {
            setSelectedFarmId(farms[0].id);
        }
    });

    const { data: taskSummary } = useQuery<TaskSummary, Error>({
        queryKey: ['analystTaskSummary'],
        queryFn: dashboardService.getTaskSummary,
    });

    const { data: farmStatuses } = useQuery<FarmStatus[], Error>({
        queryKey: ['analystFarmStatuses'],
        queryFn: dashboardService.getFarmStatuses,
    });

    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    const startDate = new Date(new Date().setDate(today.getDate() - 7)).toISOString().split('T')[0];

    const { data: waterBalance } = useQuery<WaterBalance[], Error>({
        queryKey: ['analystWaterBalance', selectedFarmId, startDate, endDate],
        queryFn: () => dashboardService.getWaterBalance(selectedFarmId!, startDate, endDate),
        enabled: !!selectedFarmId,
    });

    const taskDistribution = [
        { name: 'Pendientes', value: taskSummary?.pendingTasks ?? 0, color: '#3b82f6' },
        { name: 'En Progreso', value: taskSummary?.inProgressTasks ?? 0, color: '#f59e0b' },
        { name: 'Completadas', value: taskSummary?.completedTasks ?? 0, color: '#10b981' }
    ];

    const totalTasks = taskSummary?.totalTasks ?? 0;

    return (
        <div className="analyst-dashboard-container">
            <div className="dashboard-header">
                <h1>
                    <TrendingUp size={32} color="#3b82f6" />
                    Panel del Analista
                </h1>
                <p>Vista general del estado de las fincas y tareas</p>
            </div>

            <div className="dashboard-grid">
                {/* KPI Cards */}
                <div className="kpi-card" style={{ '--border-color': '#3b82f6' } as React.CSSProperties}>
                    <div>
                        <p className="kpi-label">Tareas Pendientes</p>
                        <h2 className="kpi-value">{taskSummary?.pendingTasks ?? 0}</h2>
                        <p className="kpi-percentage" style={{ color: '#3b82f6' }}>
                            {totalTasks > 0 ? ((taskSummary?.pendingTasks ?? 0) / totalTasks * 100).toFixed(0) : 0}% del total
                        </p>
                    </div>
                    <div className="kpi-icon" style={{ backgroundColor: '#eff6ff' }}>
                        <Clock size={24} color="#3b82f6" />
                    </div>
                </div>

                <div className="kpi-card" style={{ '--border-color': '#f59e0b' } as React.CSSProperties}>
                    <div>
                        <p className="kpi-label">En Progreso</p>
                        <h2 className="kpi-value">{taskSummary?.inProgressTasks ?? 0}</h2>
                        <p className="kpi-percentage" style={{ color: '#f59e0b' }}>
                            {totalTasks > 0 ? ((taskSummary?.inProgressTasks ?? 0) / totalTasks * 100).toFixed(0) : 0}% del total
                        </p>
                    </div>
                    <div className="kpi-icon" style={{ backgroundColor: '#fffbeb' }}>
                        <AlertCircle size={24} color="#f59e0b" />
                    </div>
                </div>

                <div className="kpi-card" style={{ '--border-color': '#10b981' } as React.CSSProperties}>
                    <div>
                        <p className="kpi-label">Completadas</p>
                        <h2 className="kpi-value">{taskSummary?.completedTasks ?? 0}</h2>
                        <p className="kpi-percentage" style={{ color: '#10b981' }}>
                            {totalTasks > 0 ? ((taskSummary?.completedTasks ?? 0) / totalTasks * 100).toFixed(0) : 0}% del total
                        </p>
                    </div>
                    <div className="kpi-icon" style={{ backgroundColor: '#f0fdf4' }}>
                        <CheckCircle size={24} color="#10b981" />
                    </div>
                </div>

                <div className="kpi-card" style={{ '--border-color': '#8b5cf6' } as React.CSSProperties}>
                    <div>
                        <p className="kpi-label">Total de Tareas</p>
                        <h2 className="kpi-value">{totalTasks}</h2>
                        <p className="kpi-percentage" style={{ color: '#6b7280' }}>Todas las tareas</p>
                    </div>
                    <div className="kpi-icon" style={{ backgroundColor: '#f5f3ff' }}>
                        <Calendar size={24} color="#8b5cf6" />
                    </div>
                </div>

                {/* Map Widget */}
                <div className="map-widget">
                    <h3 className="widget-title">
                        <div className="title-bar" style={{ backgroundColor: '#3b82f6' }} />
                        Estado General de Fincas
                    </h3>
                    <div className="map-placeholder">
                        <MapPin size={48} color="#9ca3af" />
                        <p>Mapa de ubicación de fincas</p>
                        <div className="farm-status-cards">
                            {farmStatuses?.map(farm => (
                                <div key={farm.farmId} className="farm-status-card">
                                    <div className="farm-status-header">
                                        <MapPin size={16} color={farm.activeAlertsCount > 0 ? '#ef4444' : '#10b981'} />
                                        <strong>{farm.name}</strong>
                                    </div>
                                    <p className="farm-status-text">
                                        Estado: <span style={{ color: farm.status === 'OK' ? '#10b981' : '#f59e0b', fontWeight: '500' }}>{farm.status}</span>
                                    </p>
                                    {farm.activeAlertsCount > 0 && (
                                        <p className="farm-alert-text">
                                            ⚠️ {farm.activeAlertsCount} alertas activas
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Task Distribution */}
                <div className="task-distribution-widget">
                     <h3 className="widget-title">
                        <div className="title-bar" style={{ backgroundColor: '#8b5cf6' }} />
                        Distribución de Tareas
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={taskDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(entry) => `${entry.name}: ${entry.value}`}>
                                {taskDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="widget-footer">
                        <Link to="/analyst/tasks" className="widget-button">
                            Gestionar Tareas
                        </Link>
                    </div>
                </div>

                {/* Water Balance */}
                <div className="water-balance-widget">
                    <h3 className="widget-title">
                        <div className="title-bar" style={{ backgroundColor: '#10b981' }} />
                        Balance Hídrico (Últimos 7 días)
                    </h3>
                    <div className="farm-selector">
                        <label>Finca</label>
                        <select value={selectedFarmId} onChange={(e) => setSelectedFarmId(Number(e.target.value))}>
                            {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={waterBalance}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={(dateStr) => new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })} />
                            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Bar dataKey="irrigationWater" name="Riego (m³)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="effectiveRain" name="Lluvia (mm)" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AnalystDashboard;