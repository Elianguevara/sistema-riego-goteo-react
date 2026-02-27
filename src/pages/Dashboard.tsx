import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import adminService from '../services/adminService';
import farmService from '../services/farmService';
import type { KpiResponse, UserStatsResponse } from '../types/dashboard.types';
import type { UserResponse } from '../types/user.types';
import type { Farm, Sector } from '../types/farm.types';
import type { Page } from '../types/audit.types';
import StatusToggle from '../components/ui/StatusToggle';
import './Dashboard.css';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import StatCard from '../components/ui/StatCard';
import { Search, Users, Mountain, Cpu, AlertTriangle, BarChart2 } from 'lucide-react';

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

// --- TABLA DE USUARIOS CON DATOS LIMITADOS ---
const UserTable = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: usersPage, isLoading, isError, error } = useQuery<Page<UserResponse>, Error>({
        queryKey: ['usersDashboard'],
        queryFn: () => adminService.getUsers({ page: 0, size: 5, sort: 'lastLogin,desc' }),
    });

    const users = usersPage?.content ?? [];

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        return users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    if (isLoading) return <TableSkeleton columns={5} />;
    if (isError) return <ErrorState message={error.message} />;

    return (
        <div className="dashboard-table-container">
            <div className="table-header">
                <h2 className="table-title">Usuarios Recientes</h2>
                <div className="search-container">
                    <Search size={16} className="search-icon" />
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
                            <td><StatusToggle isActive={user.active} isLoading={false} onChange={() => { }} /></td>
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
    if (isError) return <ErrorState message={error.message} />;

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

// Se reemplaza el componente provisional por uno funcional
const SectorsTable = () => {
    const navigate = useNavigate();
    const { data: sectors = [], isLoading, isError, error } = useQuery<Sector[], Error>({
        queryKey: ['activeSectors'],
        queryFn: farmService.getActiveSectors,
    });

    if (isLoading) return <TableSkeleton columns={4} />;
    if (isError) return <ErrorState message={error.message} />;

    return (
        <div className="dashboard-table-container">
            <div className="table-header">
                <h2 className="table-title">Sectores Activos</h2>
                <button className="btn-secondary" onClick={() => navigate('/farms')}>
                    Gestionar Fincas
                </button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Sector</th>
                        <th>Finca</th>
                        <th>Equipo Asignado</th>
                    </tr>
                </thead>
                <tbody>
                    {sectors.map((sector) => (
                        <tr key={sector.id} onClick={() => navigate(`/farms/${sector.farmId}`)} style={{ cursor: 'pointer' }}>
                            <td>{sector.name}</td>
                            <td>{sector.farmName}</td>
                            <td>{sector.equipmentName || 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

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
                                style={{ width: `${(count / (userStats.totalUsers || 1)) * 100}%` }}
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

    if (isLoading) return <LoadingState message="Cargando dashboard..." />;
    if (isError) return <ErrorState message={error.message} />;

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
        <div className="dashboard-page-container">
            <div className="stats-cards-grid">
                <StatCard label="Usuarios" value={kpis?.totalUsers ?? 'N/A'} icon={<Users size={20} />} variant="info" iconPosition="left" isActive={activeTable === 'users'} onClick={() => setActiveTable('users')} />
                <StatCard label="Fincas" value={kpis?.totalFarms ?? 'N/A'} icon={<Mountain size={20} />} variant="primary" iconPosition="left" isActive={activeTable === 'farms'} onClick={() => setActiveTable('farms')} />
                <StatCard label="Sectores" value={kpis?.activeSectors ?? 'N/A'} icon={<Cpu size={20} />} variant="cyan" iconPosition="left" isActive={activeTable === 'sectors'} onClick={() => setActiveTable('sectors')} />
                <StatCard label="Alertas" value={kpis?.activeAlerts ?? 'N/A'} icon={<AlertTriangle size={20} />} variant="danger" iconPosition="left" isActive={activeTable === 'alerts'} onClick={() => setActiveTable('alerts')} />
                <StatCard label="Analíticas" value="Ver" icon={<BarChart2 size={20} />} variant="accent" iconPosition="left" isActive={activeTable === 'user-stats'} onClick={() => setActiveTable('user-stats')} />
            </div>

            <div className="table-display-area">
                {renderActiveTable()}
            </div>
        </div>
    );
};

export default Dashboard;

