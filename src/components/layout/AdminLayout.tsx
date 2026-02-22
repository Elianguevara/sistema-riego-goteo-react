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
                            <i className="fas fa-grid-2"></i> <span>Panel Principal</span>
                        </Link>
                        <Link to="/tasks" className={location.pathname.startsWith('/tasks') ? 'active' : ''}>
                            <i className="fas fa-list-check"></i> <span>Mis Tareas</span>
                        </Link>
                        <Link to="/operator/irrigation" className={location.pathname === '/operator/irrigation' ? 'active' : ''}>
                            <i className="fas fa-droplet"></i> <span>Registrar Riego</span>
                        </Link>
                        <Link to="/operator/fertilization" className={location.pathname === '/operator/fertilization' ? 'active' : ''}>
                            <i className="fas fa-flask"></i> <span>Fertilización</span>
                        </Link>
                        <Link to="/operator/maintenance" className={location.pathname === '/operator/maintenance' ? 'active' : ''}>
                            <i className="fas fa-wrench"></i> <span>Mantenimiento</span>
                        </Link>
                        <Link to="/operator/logbook" className={location.pathname === '/operator/logbook' ? 'active' : ''}>
                            <i className="fas fa-book-open"></i> <span>Bitácora</span>
                        </Link>
                        <Link to="/notifications" className={location.pathname === '/notifications' ? 'active' : ''}>
                            <i className="fas fa-bell"></i> <span>Notificaciones</span>
                        </Link>
                    </>
                );
            case 'ANALISTA':
                return (
                    <>
                        <Link to="/analyst/dashboard" className={location.pathname === '/analyst/dashboard' ? 'active' : ''}>
                            <i className="fas fa-chart-pie"></i> <span>Dashboard</span>
                        </Link>
                        <Link to="/analyst/tasks" className={location.pathname.startsWith('/analyst/tasks') ? 'active' : ''}>
                            <i className="fas fa-calendar-check"></i> <span>Gestión Tareas</span>
                        </Link>
                        <Link to="/analyst/irrigation-analysis" className={location.pathname.startsWith('/analyst/irrigation-analysis') ? 'active' : ''}>
                            <i className="fas fa-chart-line"></i> <span>Análisis Riego</span>
                        </Link>
                        <Link to="/analyst/precipitation" className={location.pathname.startsWith('/analyst/precipitation') ? 'active' : ''}>
                            <i className="fas fa-cloud-showers-heavy"></i> <span>Lluvias</span>
                        </Link>
                        <Link to="/farms" className={location.pathname.startsWith('/farms') ? 'active' : ''}>
                            <i className="fas fa-seedling"></i> <span>Gestión Fincas</span>
                        </Link>
                        <Link to="/analyst/reports" className={location.pathname.startsWith('/analyst/reports') ? 'active' : ''}>
                            <i className="fas fa-file-chart-column"></i> <span>Reportes</span>
                        </Link>
                        <Link to="/notifications" className={location.pathname === '/notifications' ? 'active' : ''}>
                            <i className="fas fa-bell"></i> <span>Notificaciones</span>
                        </Link>
                    </>
                );
            case 'ADMIN':
            default:
                return (
                     <>
                        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
                            <i className="fas fa-objects-column"></i> <span>Principal</span>
                        </Link>
                        <Link to="/users" className={location.pathname === '/users' ? 'active' : ''}>
                            <i className="fas fa-users-gear"></i> <span>Usuarios</span>
                        </Link>
                        <Link to="/farms" className={location.pathname.startsWith('/farms') ? 'active' : ''}>
                            <i className="fas fa-mountain-sun"></i> <span>Fincas</span>
                        </Link>
                        <Link to="/audit" className={location.pathname === '/audit' ? 'active' : ''}>
                            <i className="fas fa-shield-halved"></i> <span>Auditoría</span>
                        </Link>
                         <Link to="/notifications" className={location.pathname === '/notifications' ? 'active' : ''}>
                            <i className="fas fa-bell"></i> <span>Notificaciones</span>
                        </Link>
                        <Link to="/config" className={location.pathname === '/config' ? 'active' : ''}>
                            <i className="fas fa-sliders"></i> <span>Configuración</span>
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
                    <div className="header-breadcrumbs">
                        {/* Se puede añadir lógica de migas de pan aquí en el futuro */}
                    </div>
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

