import { useQuery } from '@tanstack/react-query';
import dashboardService from '../services/dashboardService';
import type { KpiResponse } from '../types/dashboard.types';
import './Dashboard.css';

// Placeholder para la tabla de usuarios (se mantiene igual)
const UserTable = () => {
    const users = [
        { name: 'John Doe', role: 'Administrador', state: 'Inactivo' },
        { name: 'Mary Johnson', role: 'Analista', state: 'Activo' },
        { name: 'Robert Smith', role: 'Operante', state: 'Activo' },
        { name: 'Patricia Brown', role: 'Analista', state: 'Activo' },
        { name: 'James Wilson', role: 'Operante', state: 'Activo' },
        { name: 'Linda Davis', role: 'Analista', state: 'Activo' },
    ];

    return (
        <div className="user-table-container">
            <h2 className="table-title">Usuarios</h2>
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={index}>
                            <td>{user.name}</td>
                            <td>{user.role}</td>
                            <td><span className="status-badge active">{user.state}</span></td>
                            <td className="actions">
                                <i className="fas fa-check-circle action-icon"></i>
                                <i className="fas fa-ellipsis-v action-icon"></i>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


const Dashboard = () => {
  // 1. Reemplazamos los 3 'useState' y el 'useEffect' por una sola llamada a 'useQuery'.
  const { data: kpis, isLoading, isError, error } = useQuery<KpiResponse, Error>({
    queryKey: ['dashboardKpis'], // Una clave única para esta consulta. React Query la usa para cachear.
    queryFn: dashboardService.getKpis, // La función que se ejecutará para obtener los datos.
  });

  // 2. El manejo de estados de carga y error ahora es más simple.
  if (isLoading) {
    return <div className="dashboard-page"><p>Cargando estadísticas...</p></div>;
  }

  if (isError) {
    return <div className="dashboard-page"><p className="error-text">Error: {error.message}</p></div>;
  }

  // 3. Renderizado principal con los datos de la API.
  return (
    <div>
      <div className="stats-cards-grid">
        <div className="stat-card">
          <div className="card-icon blue"><i className="fas fa-users"></i></div>
          <div className="card-info">
            <span className="card-value">{kpis?.totalUsers ?? 'N/A'}</span>
            <span className="card-label">Total de Usuarios</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="card-icon green"><i className="fas fa-seedling"></i></div>
          <div className="card-info">
            <span className="card-value">{kpis?.totalFarms ?? 'N/A'}</span>
            <span className="card-label">Total de Fincas</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="card-icon cyan"><i className="fas fa-th-large"></i></div>
          <div className="card-info">
            <span className="card-value">{kpis?.activeSectors ?? 'N/A'}</span>
            <span className="card-label">Sectores Activos</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="card-icon red"><i className="fas fa-exclamation-triangle"></i></div>
          <div className="card-info">
            <span className="card-value">{kpis?.activeAlerts ?? 'N/A'}</span>
            <span className="card-label">Alertas Activas</span>
          </div>
        </div>
      </div>
      {/* La tabla de usuarios sigue siendo estática por ahora */}
      <UserTable />
    </div>
  );
};

export default Dashboard;