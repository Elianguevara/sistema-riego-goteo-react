// src/pages/operator/OperatorDashboard.tsx

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import taskService from '../../services/taskService';
import farmService from '../../services/farmService';
import weatherService from '../../services/weatherService';
import type { Task } from '../../types/task.types';
import type { Farm } from '../../types/farm.types';
import type { CurrentWeather } from '../../types/weather.types';
import WeatherWidget from '../../components/weather/WeatherWidget';
import './OperatorDashboard.css'; // Crearemos este archivo a continuación

const OperatorDashboard = () => {
    // 1. OBTENER DATOS
    const { data: tasks = [] } = useQuery<Task[], Error>({
        queryKey: ['myTasks'],
        queryFn: taskService.getMyTasks,
    });

    const { data: farms = [] } = useQuery<Farm[], Error>({
        queryKey: ['myFarms'],
        queryFn: farmService.getFarms
    });

    const primaryFarm = farms?.[0];

    const { data: weatherData, isLoading: isLoadingWeather, error: weatherError } = useQuery<CurrentWeather, Error>({
        queryKey: ['weather', primaryFarm?.id],
        queryFn: () => weatherService.getCurrentWeather(primaryFarm!.id),
        enabled: !!primaryFarm,
        retry: false,
    });

    // 2. FILTRAR TAREAS
    const pendingTasksCount = tasks.filter(t => t.status === 'PENDIENTE').length;
    const inProgressTasksCount = tasks.filter(t => t.status === 'EN_PROGRESO').length;

    // 3. RENDERIZAR COMPONENTE
    return (
        <div className="operator-dashboard">
            <h1>Panel del Operario</h1>
            <div className="dashboard-grid">
                {/* Columna Izquierda: Tareas y Accesos directos */}
                <div className="dashboard-main-column">
                    <div className="summary-cards">
                        <div className="summary-card pending">
                            <span className="count">{pendingTasksCount}</span>
                            <span className="label">Tareas Pendientes</span>
                            <Link to="/tasks" className="card-link">Ver Tareas</Link>
                        </div>
                        <div className="summary-card in-progress">
                            <span className="count">{inProgressTasksCount}</span>
                            <span className="label">Tareas En Progreso</span>
                            <Link to="/tasks" className="card-link">Ver Tareas</Link>
                        </div>
                    </div>
                    <div className="quick-actions-card">
                        <h3>Accesos Rápidos</h3>
                        <div className="actions-grid">
                            <Link to="/operator/irrigation" className="action-button">
                                <i className="fas fa-tint"></i>
                                <span>Registrar Riego</span>
                            </Link>
                             <Link to="/operator/fertilization" className="action-button">
                                <i className="fas fa-vial"></i>
                                <span>Registrar Fertilización</span>
                            </Link>
                            <Link to="/operator/maintenance" className="action-button">
                                <i className="fas fa-tools"></i>
                                <span>Registrar Mantenimiento</span>
                            </Link>
                             <Link to="/operator/logbook" className="action-button">
                                <i className="fas fa-book"></i>
                                <span>Ver Bitácora</span>
                            </Link>
                        </div>
                    </div>
                </div>
                {/* Columna Derecha: Clima y Finca */}
                <div className="dashboard-side-column">
                    {primaryFarm && (
                        <div className="farm-info-card">
                            <h3>Tu Finca Principal</h3>
                            <div className="farm-details">
                                <i className="fas fa-map-marker-alt"></i>
                                <div>
                                    <strong>{primaryFarm.name}</strong>
                                    <p>{primaryFarm.location}</p>
                                </div>
                            </div>
                             <WeatherWidget
                                weatherData={weatherData}
                                isLoading={isLoadingWeather}
                                error={weatherError}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OperatorDashboard;