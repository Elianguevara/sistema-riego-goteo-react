//import React from 'react';
import { useState } from 'react'; // Importar useState
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner'; // <-- Importar Toaster
import './AdminLayout.css';
import authService from '../../services/authService';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarVisible, setIsSidebarVisible] = useState(false); // Estado para el menú móvil

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    return (
        <div className={`admin-layout ${isSidebarVisible ? 'sidebar-visible' : ''}`}>
            {/* Overlay para cerrar el menú al hacer clic fuera */}
            {isSidebarVisible && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

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
                <Toaster richColors position="top-right" /> {/* <-- Añadir Toaster aquí */}
                <header className="main-header">
                    {/* Botón de Hamburguesa para móvil */}
                    <button className="mobile-menu-button" onClick={toggleSidebar}>
                        <i className="fas fa-bars"></i>
                    </button>

                    <div className="user-profile" onClick={handleLogout} title="Cerrar sesión">
                        <div className="avatar">EG</div>
                        <div className="user-info">
                            <span className="user-name">Elian Guevara</span>
                            <span className="user-role">Administrador</span>
                        </div>
                        <i className="fas fa-chevron-down"></i>
                    </div>
                </header>
                <div className="content-area">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;