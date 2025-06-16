//import React from 'react';
import { useState, useEffect } from 'react';
import dashboardService from '../services/dashboardService';
import type { KpiResponse } from '../types/dashboard.types';
import './Dashboard.css';

// Placeholder para la tabla de usuarios
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
  // 1. Estados para manejar los datos, la carga y los errores
  const [kpis, setKpis] = useState<KpiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. useEffect para cargar los datos cuando el componente se monta
  useEffect(() => {
    const fetchKpis = async () => {
      try {
        setIsLoading(true);
        const data = await dashboardService.getKpis();
        setKpis(data);
        setError(null);
      } catch (err) {
        setError('No se pudieron cargar las estadísticas del dashboard.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKpis();
  }, []); // El array vacío asegura que se ejecute solo una vez

  // 3. Renderizado condicional para los estados de carga y error
  if (isLoading) {
    return <p>Cargando estadísticas...</p>;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

// 4. Renderizado principal con los datos de la API
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