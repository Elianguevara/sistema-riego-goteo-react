// Archivo: src/pages/analyst/AnalystDashboardView.tsx

import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { FarmStatus, WaterBalance, TaskSummary } from '../../types/analyst.types';
import type { Farm } from '../../types/farm.types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
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

interface TaskDistributionItem {
    name: string;
    value: number;
    color: string;
    [key: string]: unknown;
}

interface AnalystDashboardViewProps {
    taskSummary: TaskSummary | undefined;
    taskDistribution: TaskDistributionItem[];
    totalTasks: number;
    waterBalance: WaterBalance[] | undefined;
    farms: Farm[];
    farmsWithCoords: FarmStatus[];
    mapCenter: [number, number];
    selectedFarmId: number | undefined;
    onFarmChange: (farmId: number) => void;
}

const AnalystDashboardView = ({
    taskSummary,
    taskDistribution,
    totalTasks,
    waterBalance,
    farms,
    farmsWithCoords,
    mapCenter,
    selectedFarmId,
    onFarmChange,
}: AnalystDashboardViewProps) => (
    <div className="analyst-dashboard-container">
        <div className="dashboard-header">
            <h1>
                <TrendingUp size={32} color="#3b82f6" />
                Panel del Analista
            </h1>
            <p>Vista general del estado de las fincas y tareas</p>
        </div>

        <div className="dashboard-grid">
            <div className="kpi-card" style={{ '--border-color': '#3b82f6' } as CSSProperties}>
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

            <div className="kpi-card" style={{ '--border-color': '#f59e0b' } as CSSProperties}>
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

            <div className="kpi-card" style={{ '--border-color': '#10b981' } as CSSProperties}>
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

            <div className="kpi-card" style={{ '--border-color': '#8b5cf6' } as CSSProperties}>
                <div>
                    <p className="kpi-label">Total de Tareas</p>
                    <h2 className="kpi-value">{totalTasks}</h2>
                    <p className="kpi-percentage" style={{ color: '#6b7280' }}>Todas las tareas</p>
                </div>
                <div className="kpi-icon" style={{ backgroundColor: '#f5f3ff' }}>
                    <Calendar size={24} color="#8b5cf6" />
                </div>
            </div>

            <div className="map-widget">
                <h3 className="widget-title">
                    <div className="title-bar" style={{ backgroundColor: '#3b82f6' }} />
                    Estado General de Fincas
                </h3>
                <MapContainer center={mapCenter} zoom={8} scrollWheelZoom={false} style={{ height: 'calc(100% - 40px)', borderRadius: '8px' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {farmsWithCoords.map(farm => (
                        <Marker key={farm.farmId} position={[farm.latitude, farm.longitude]}>
                            <Popup>
                                <strong>{farm.name}</strong><br />
                                Estado: {farm.status} <br />
                                {farm.activeAlertsCount > 0 && `Alertas: ${farm.activeAlertsCount}`}
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

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

            <div className="water-balance-widget">
                <h3 className="widget-title">
                    <div className="title-bar" style={{ backgroundColor: '#10b981' }} />
                    Balance Hídrico (Últimos 7 días)
                </h3>
                <div className="farm-selector">
                    <label>Finca</label>
                    <select value={selectedFarmId} onChange={(e) => onFarmChange(Number(e.target.value))}>
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

export default AnalystDashboardView;
