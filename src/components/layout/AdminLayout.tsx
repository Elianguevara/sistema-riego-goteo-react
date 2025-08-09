// Archivo: src/components/layout/AdminLayout.tsx

import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import ProfileMenu from './ProfileMenu';
import NotificationBell from './NotificationBell'; // Componente de campana de notificaciones
import './AdminLayout.css';
import { useAuthData } from '../../hooks/useAuthData';

const AdminLayout = () => {
    const location = useLocation();
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const authData = useAuthData();

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

                    {/* Nuevo enlace a Notificaciones solo para ADMIN */}
                    {authData?.role === 'ADMIN' && (
                        <Link to="/notifications" className={location.pathname === '/notifications' ? 'active' : ''}>
                            <i className="fas fa-bell"></i> Notificaciones
                        </Link>
                    )}

                    <Link to="/users" className={location.pathname === '/users' ? 'active' : ''}>
                        <i className="fas fa-users"></i> Usuarios
                    </Link>
                    <Link to="/farms" className={location.pathname.startsWith('/farms') ? 'active' : ''}>
                        <i className="fas fa-seedling"></i> Fincas
                    </Link>
                    
                    {authData?.role === 'ADMIN' && (
                        <Link to="/audit" className={location.pathname === '/audit' ? 'active' : ''}>
                            <i className="fas fa-history"></i> Auditoría
                        </Link>
                    )}

                    <Link to="/config" className={location.pathname === '/config' ? 'active' : ''}>
                        <i className="fas fa-cog"></i> Configuración
                    </Link>
                </nav>
            </aside>
            <main className="main-content">
                <Toaster richColors position="top-right" />
                <header className="main-header">
                    <button className="mobile-menu-button" onClick={toggleSidebar}>
                        <i className="fas fa-bars"></i>
                    </button>
                    <div className="header-actions"> 
                        <NotificationBell /> {/* Campana de notificaciones en el header */}
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
