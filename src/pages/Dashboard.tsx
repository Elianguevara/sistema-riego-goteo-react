import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import adminService from '../services/adminService';
import farmService from '../services/farmService';
import type { KpiResponse, UserStatsResponse } from '../types/dashboard.types';
import type { UserResponse } from '../types/user.types';
import type { Farm } from '../types/farm.types';
import StatusToggle from '../components/ui/StatusToggle';
import './Dashboard.css';

// --- COMPONENTE REUTILIZABLE: SKELETON LOADER PARA TABLAS ---
const TableSkeleton = ({ columns, rows = 5 }: { columns: number, rows?: number }) => (
    <div className="dashboard-table-container skeleton-container">
        <table>
            <thead>
                <tr>
                    {Array.from({ length: columns }).map((_, i) => <th key={i}><div className="skeleton skeleton-text-header"></div></th>)}
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: rows }).map((_, i) => (
                    <tr key={i}>
                        {Array.from({ length: columns }).map((_, j) => <td key={j}><div className="skeleton skeleton-text"></div></td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


// --- TABLA DE USUARIOS CON SKELETON LOADER ---
const UserTable = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: users = [], isLoading, isError, error } = useQuery<UserResponse[], Error>({
        queryKey: ['users'],
        queryFn: adminService.getUsers,
    });

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        return users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    if (isLoading) return <TableSkeleton columns={5} />;
    if (isError) return <p className="error-text">Error al cargar usuarios: {error.message}</p>;

    return (
        <div className="dashboard-table-container">
            <div className="table-header">
                <h2 className="table-title">Usuarios</h2>
                <div className="search-container">
                    <i className="fas fa-search search-icon"></i>
                    <input
                        type="text"
                        placeholder="Buscar usuario..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map((user) => (
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.roleName}</td>
                            <td><StatusToggle isActive={user.active} isLoading={false} onChange={() => {}} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- TABLA DE FINCAS CON SKELETON LOADER ---
const FarmsTable = () => {
    const navigate = useNavigate();
    const { data: farms = [], isLoading, isError, error } = useQuery<Farm[], Error>({
        queryKey: ['farms'],
        queryFn: farmService.getFarms,
    });

    if (isLoading) return <TableSkeleton columns={4} />;
    if (isError) return <p className="error-text">Error al cargar fincas: {error.message}</p>;

    return (
        <div className="dashboard-table-container">
            <div className="table-header">
                <h2 className="table-title">Fincas</h2>
                <Link to="/farms" className="btn-secondary">Gestionar Fincas</Link>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Ubicación</th>
                        <th>Tamaño (ha)</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {farms.map((farm) => (
                        <tr key={farm.id}>
                            <td>{farm.name}</td>
                            <td>{farm.location}</td>
                            <td>{farm.farmSize}</td>
                            <td>
                                <button className="btn-secondary" onClick={() => navigate(`/farms/${farm.id}`)}>
                                    Ver Detalles
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- COMPONENTES PLACEHOLDER ---
const SectorsTable = () => (
    <div className="dashboard-table-container">
        <h2 className="table-title">Sectores Activos</h2>
        <p>Vista de tabla de sectores activos no implementada aún.</p>
    </div>
);

const AlertsTable = () => (
    <div className="dashboard-table-container">
        <h2 className="table-title">Alertas Activas</h2>
        <p>Vista de tabla de alertas activas no implementada aún.</p>
    </div>
);

// --- COMPONENTE PARA VISUALIZAR ESTADÍSTICAS DE USUARIO ---
const UserStatsDisplay = () => {
    const { data: userStats, isLoading, isError, error } = useQuery<UserStatsResponse, Error>({
        queryKey: ['userStats'],
        queryFn: dashboardService.getUserStats,
        retry: (failureCount, error) => {
            if (error.message === 'No tienes permiso para ver estas estadísticas') {
                return false;
            }
            return failureCount < 3;
        },
    });

    if (isLoading) {
        return <TableSkeleton columns={2} rows={4} />;
    }
    
    if (isError) {
        return (
            <div className="dashboard-table-container">
                 <div className="table-header">
                    <h2 className="table-title">Estadísticas de Usuarios</h2>
                </div>
                <p className="error-text">{error.message}</p>
            </div>
        );
    }
    
    return (
        <div className="dashboard-table-container">
            <div className="table-header">
                <h2 className="table-title">Estadísticas de Usuarios</h2>
            </div>
            <div className="stats-grid">
                <div className="stat-item">
                    <span className="stat-label">Usuarios Totales</span>
                    <span className="stat-value">{userStats?.totalUsers}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Activos</span>
                    <span className="stat-value active">{userStats?.activeUsers}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Inactivos</span>
                    <span className="stat-value inactive">{userStats?.inactiveUsers}</span>
                </div>
            </div>
            <div className="roles-stats">
                <h3>Distribución por Rol</h3>
                {userStats?.usersByRole && Object.entries(userStats.usersByRole).map(([role, count]) => (
                    <div className="role-item" key={role}>
                        <span className="role-name">{role}</span>
                        <div className="role-bar-container">
                            <div 
                                className="role-bar" 
                                style={{ width: `${(count / (userStats.totalUsers || 1)) * 100}%`}}
                            ></div>
                        </div>
                        <span className="role-count">{count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL DEL DASHBOARD ---
const Dashboard = () => {
  const [activeTable, setActiveTable] = useState<'users' | 'farms' | 'sectors' | 'alerts' | 'user-stats'>('users');

  const { data: kpis, isLoading, isError, error } = useQuery<KpiResponse, Error>({
    queryKey: ['dashboardKpis'],
    queryFn: dashboardService.getKpis,
  });

  if (isLoading) {
    return <div className="dashboard-page"><p>Cargando dashboard...</p></div>;
  }

  if (isError) {
    return <div className="dashboard-page"><p className="error-text">Error al cargar el dashboard: {error.message}</p></div>;
  }

  const renderActiveTable = () => {
    switch (activeTable) {
        case 'users':
            return <UserTable />;
        case 'farms':
            return <FarmsTable />;
        case 'sectors':
            return <SectorsTable />;
        case 'alerts':
            return <AlertsTable />;
        case 'user-stats':
            return <UserStatsDisplay />;
        default:
            return <UserTable />;
    }
  };

  return (
    <div>
      <div className="stats-cards-grid">
        <div className={`stat-card ${activeTable === 'users' ? 'active' : ''}`} onClick={() => setActiveTable('users')}>
          <div className="card-icon blue"><i className="fas fa-users"></i></div>
          <div className="card-info">
            <span className="card-value">{kpis?.totalUsers ?? 'N/A'}</span>
            <span className="card-label">Total de Usuarios</span>
          </div>
        </div>
        <div className={`stat-card ${activeTable === 'farms' ? 'active' : ''}`} onClick={() => setActiveTable('farms')}>
          <div className="card-icon green"><i className="fas fa-seedling"></i></div>
          <div className="card-info">
            <span className="card-value">{kpis?.totalFarms ?? 'N/A'}</span>
            <span className="card-label">Total de Fincas</span>
          </div>
        </div>
        <div className={`stat-card ${activeTable === 'sectors' ? 'active' : ''}`} onClick={() => setActiveTable('sectors')}>
          <div className="card-icon cyan"><i className="fas fa-th-large"></i></div>
          <div className="card-info">
            <span className="card-value">{kpis?.activeSectors ?? 'N/A'}</span>
            <span className="card-label">Sectores Activos</span>
          </div>
        </div>
        <div className={`stat-card ${activeTable === 'alerts' ? 'active' : ''}`} onClick={() => setActiveTable('alerts')}>
          <div className="card-icon red"><i className="fas fa-exclamation-triangle"></i></div>
          <div className="card-info">
            <span className="card-value">{kpis?.activeAlerts ?? 'N/A'}</span>
            <span className="card-label">Alertas Activas</span>
          </div>
        </div>
        {/* Nueva Tarjeta para Estadísticas de Usuarios */}
        <div 
          className={`stat-card ${activeTable === 'user-stats' ? 'active' : ''}`} 
          onClick={() => setActiveTable('user-stats')}
        >
            <div className="card-icon purple"><i className="fas fa-chart-pie"></i></div>
            <div className="card-info">
                <span className="card-value">Ver</span>
                <span className="card-label">Estadísticas de Usuarios</span>
            </div>
        </div>
      </div>
      
      <div className="table-display-area">
        {renderActiveTable()}
      </div>
    </div>
  );
};

export default Dashboard;