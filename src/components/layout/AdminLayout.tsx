// Archivo: src/components/layout/AdminLayout.tsx

import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import ProfileMenu from './ProfileMenu';
import NotificationBell from './NotificationBell';
import './AdminLayout.css';
import { useAuthData } from '../../hooks/useAuthData';

const AdminLayout = () => {
    const location = useLocation();
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const authData = useAuthData();

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const userRole = authData?.role;

    const getNavLinks = () => {
        switch (userRole) {
            case 'OPERARIO':
                return (
                    <>
                        <Link to="/operator/dashboard" className={location.pathname === '/operator/dashboard' ? 'active' : ''}>
                            <i className="fas fa-home"></i> Panel Principal
                        </Link>
                        <Link to="/tasks" className={location.pathname.startsWith('/tasks') ? 'active' : ''}>
                            <i className="fas fa-clipboard-list"></i> Mis Tareas
                        </Link>
                        
                        <Link to="/operator/irrigation" className={location.pathname === '/operator/irrigation' ? 'active' : ''}>
                            <i className="fas fa-tint"></i> Registrar Riego
                        </Link>
                        <Link to="/operator/fertilization" className={location.pathname === '/operator/fertilization' ? 'active' : ''}>
                            <i className="fas fa-vial"></i> Registrar Fertilización
                        </Link>
                        <Link to="/operator/maintenance" className={location.pathname === '/operator/maintenance' ? 'active' : ''}>
                            <i className="fas fa-tools"></i> Registrar Mantenimiento
                        </Link>
                        <Link to="/operator/logbook" className={location.pathname === '/operator/logbook' ? 'active' : ''}>
                            <i className="fas fa-book"></i> Bitácora
                        </Link>

                        <Link to="/notifications" className={location.pathname === '/notifications' ? 'active' : ''}>
                            <i className="fas fa-bell"></i> Notificaciones
                        </Link>
                    </>
                );
            case 'ANALISTA':
                return (
                    <>
                        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
                            <i className="fas fa-home"></i> Principal
                        </Link>
                        <Link to="/analyst/tasks" className={location.pathname.startsWith('/analyst/tasks') ? 'active' : ''}>
                            <i className="fas fa-tasks"></i> Gestión de Tareas
                        </Link>
                        <Link to="/analyst/precipitation" className={location.pathname.startsWith('/analyst/precipitation') ? 'active' : ''}>
                            <i className="fas fa-cloud-rain"></i> Análisis de Lluvia
                        </Link>
                        <Link to="/users" className={location.pathname === '/users' ? 'active' : ''}>
                            <i className="fas fa-users"></i> Usuarios
                        </Link>
                        <Link to="/farms" className={location.pathname.startsWith('/farms') ? 'active' : ''}>
                            <i className="fas fa-seedling"></i> Fincas
                        </Link>
                         <Link to="/config" className={location.pathname === '/config' ? 'active' : ''}>
                            <i className="fas fa-cog"></i> Configuración
                        </Link>
                    </>
                );
            case 'ADMIN':
            default:
                return (
                     <>
                        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
                            <i className="fas fa-home"></i> Principal
                        </Link>
                        <Link to="/notifications" className={location.pathname === '/notifications' ? 'active' : ''}>
                            <i className="fas fa-bell"></i> Notificaciones
                        </Link>
                        <Link to="/users" className={location.pathname === '/users' ? 'active' : ''}>
                            <i className="fas fa-users"></i> Usuarios
                        </Link>
                        <Link to="/farms" className={location.pathname.startsWith('/farms') ? 'active' : ''}>
                            <i className="fas fa-seedling"></i> Fincas
                        </Link>
                        <Link to="/audit" className={location.pathname === '/audit' ? 'active' : ''}>
                            <i className="fas fa-history"></i> Auditoría
                        </Link>
                        <Link to="/config" className={location.pathname === '/config' ? 'active' : ''}>
                            <i className="fas fa-cog"></i> Configuración
                        </Link>
                    </>
                );
        }
    };

    return (
        <div className={`admin-layout ${isSidebarVisible ? 'sidebar-visible' : ''}`}>
            {isSidebarVisible && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <i className="fas fa-leaf logo-icon"></i>
                    <h1 className="title">Hidra</h1>
                </div>
                <nav className="sidebar-nav">{getNavLinks()}</nav>
            </aside>
            <main className="main-content">
                <Toaster richColors position="top-right" />
                <header className="main-header">
                    <button className="mobile-menu-button" onClick={toggleSidebar}>
                        <i className="fas fa-bars"></i>
                    </button>
                    <div className="header-actions">
                        <NotificationBell />
                        <ProfileMenu />
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