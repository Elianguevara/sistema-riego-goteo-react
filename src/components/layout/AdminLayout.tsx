//import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import './AdminLayout.css';
import authService from '../../services/authService';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div className="admin-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <i className="fas fa-leaf logo-icon"></i>
                    <h1 className="title">Hidra</h1>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
                        <i className="fas fa-home"></i> Principal
                    </Link>
                    <Link to="/users" className={location.pathname === '/users' ? 'active' : ''}>
                        <i className="fas fa-users"></i> Usuarios
                    </Link>
                    <Link to="/farms" className={location.pathname === '/farms' ? 'active' : ''}>
                        <i className="fas fa-seedling"></i> Fincas
                    </Link>
                    <Link to="/config" className={location.pathname === '/config' ? 'active' : ''}>
                        <i className="fas fa-cog"></i> Configuración
                    </Link>
                </nav>
            </aside>
            <main className="main-content">
                <header className="main-header">
                    <div className="user-profile" onClick={handleLogout} title="Cerrar sesión">
                        {/* Aquí podrías poner una imagen de avatar real */}
                        <div className="avatar">EG</div>
                        <div className="user-info">
                            <span className="user-name">Elian Guevara</span>
                            <span className="user-role">Administrador</span>
                        </div>
                        <i className="fas fa-chevron-down"></i>
                    </div>
                </header>
                <div className="content-area">
                    <Outlet /> {/* Aquí se renderizará el componente de la ruta hija (Dashboard) */}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;