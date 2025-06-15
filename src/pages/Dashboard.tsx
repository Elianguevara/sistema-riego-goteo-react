//import React from 'react';
import './Dashboard.css';

// Placeholder para la tabla de usuarios
const UserTable = () => {
    const users = [
        { name: 'John Doe', role: 'Administrador', state: 'Activo' },
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
  return (
    <div>
      <div className="stats-cards-grid">
        <div className="stat-card">
          <div className="card-icon blue"><i className="fas fa-users"></i></div>
          <div className="card-info">
            <span className="card-value">12</span>
            <span className="card-label">Total de Usuarios</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="card-icon green"><i className="fas fa-seedling"></i></div>
          <div className="card-info">
            <span className="card-value">5</span>
            <span className="card-label">Total de Fincas</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="card-icon cyan"><i className="fas fa-th-large"></i></div>
          <div className="card-info">
            <span className="card-value">8</span>
            <span className="card-label">Sectores Activos</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="card-icon red"><i className="fas fa-exclamation-triangle"></i></div>
          <div className="card-info">
            <span className="card-label">Alertas</span>
          </div>
        </div>
      </div>
      <UserTable />
    </div>
  );
};

export default Dashboard;