// Archivo: src/pages/analyst/AnalystDashboard.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import farmService from '../../services/farmService';
import type { FarmStatus, WaterBalance, TaskSummary } from '../../types/analyst.types';
import type { Farm } from '../../types/farm.types';

// Importa los componentes de Leaflet y Recharts
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Importa los estilos de Leaflet (importante!)
import 'leaflet/dist/leaflet.css';
import './AnalystDashboard.css';

// --- WIDGET DE RESUMEN DE TAREAS ---
const TaskSummaryWidget = () => {
    const { data: summary, isLoading } = useQuery<TaskSummary, Error>({
        queryKey: ['analystTaskSummary'],
        queryFn: dashboardService.getTaskSummary,
    });

    return (
        <div className="dashboard-widget tasks-widget">
            <h3 className="widget-title">Resumen de Tareas</h3>
            {isLoading ? <p>Cargando resumen...</p> : (
                <div className="task-summary-grid">
                    <div className="task-summary-item">
                        <span className="count pending">{summary?.pendingTasks ?? 0}</span>
                        <span className="label">Pendientes</span>
                    </div>
                    <div className="task-summary-item">
                        <span className="count in-progress">{summary?.inProgressTasks ?? 0}</span>
                        <span className="label">En Progreso</span>
                    </div>
                    <div className="task-summary-item">
                        <span className="count completed">{summary?.completedTasks ?? 0}</span>
                        <span className="label">Completadas</span>
                    </div>
                    <div className="task-summary-item">
                        <span className="count total">{summary?.totalTasks ?? 0}</span>
                        <span className="label">Total</span>
                    </div>
                </div>
            )}
            <div className="widget-footer">
                <Link to="/analyst/tasks" className="btn-secondary">Gestionar Tareas</Link>
            </div>
        </div>
    );
};

// --- WIDGET DE MAPA DE FINCAS ---
const FarmMapWidget = () => {
    const { data: farmStatuses, isLoading } = useQuery<FarmStatus[], Error>({
        queryKey: ['analystFarmStatuses'],
        queryFn: dashboardService.getFarmStatuses,
    });

    // Centra el mapa en una ubicación por defecto o en la primera finca
    const mapCenter: [number, number] = farmStatuses && farmStatuses.length > 0
        ? [farmStatuses[0].latitude, farmStatuses[0].longitude]
        : [-32.88, -68.84]; // Mendoza, Argentina

    return (
        <div className="dashboard-widget map-widget">
            <h3 className="widget-title">Estado General de Fincas</h3>
            {isLoading ? <p>Cargando mapa...</p> : (
                 <MapContainer center={mapCenter} zoom={10} scrollWheelZoom={false} className="leaflet-container">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {farmStatuses?.map(farm => (
                        <Marker key={farm.farmId} position={[farm.latitude, farm.longitude]}>
                            <Popup>
                                <strong>{farm.name}</strong><br />
                                Estado: {farm.status} <br />
                                {farm.activeAlertsCount > 0 && `Alertas: ${farm.activeAlertsCount}`}
                                <br/><Link to={`/farms/${farm.farmId}`}>Ver Detalles</Link>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            )}
        </div>
    );
};

// --- WIDGET DE BALANCE HÍDRICO ---
const WaterBalanceWidget = () => {
    const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>();
    
    const { data: farms = [] } = useQuery<Farm[], Error>({
        queryKey: ['farmsForAnalyst'],
        queryFn: farmService.getFarms,
    });

    // Establecer la primera finca como seleccionada por defecto
    useState(() => {
        if (farms.length > 0 && !selectedFarmId) {
            setSelectedFarmId(farms[0].id);
        }
    });
    
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    const startDate = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];

    const { data: waterBalance, isLoading } = useQuery<WaterBalance[], Error>({
        queryKey: ['analystWaterBalance', selectedFarmId],
        queryFn: () => dashboardService.getWaterBalance(selectedFarmId!, startDate, endDate),
        enabled: !!selectedFarmId,
    });
    
    return (
        <div className="dashboard-widget water-balance-widget">
             <h3 className="widget-title">Balance Hídrico (Últimos 30 días)</h3>
             <div className="water-balance-controls">
                <label>Finca:</label>
                <select onChange={(e) => setSelectedFarmId(Number(e.target.value))} value={selectedFarmId || ''}>
                    {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
             </div>
             {isLoading ? <p>Cargando datos...</p> : (
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={waterBalance} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(dateStr) => new Date(dateStr).toLocaleDateString('es-AR', {day: '2-digit', month: '2-digit'})} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="irrigationWater" name="Agua de Riego (m³)" fill="#3498db" />
                        <Bar dataKey="effectiveRain" name="Lluvia Efectiva (mm)" fill="#2ecc71" />
                    </BarChart>
                </ResponsiveContainer>
             )}
        </div>
    );
};

// --- COMPONENTE PRINCIPAL DEL DASHBOARD ---
const AnalystDashboard = () => {
    return (
        <div className="analyst-dashboard">
            <h1>Panel del Analista</h1>
            <div className="dashboard-grid-analyst">
                <FarmMapWidget />
                <TaskSummaryWidget />
                <WaterBalanceWidget />
            </div>
        </div>
    );
};

export default AnalystDashboard;