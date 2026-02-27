// Archivo: src/components/layout/AdminLayout.tsx

import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import ProfileMenu from './ProfileMenu';
import NotificationBell from './NotificationBell';
import './AdminLayout.css';
import { useAuthData } from '../../hooks/useAuthData';
import { getNavItems } from '../../config/navigationConfig';
import { Leaf, Menu } from 'lucide-react';

const AdminLayout = () => {
    const location = useLocation();
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const authData = useAuthData();

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const userRole = authData?.role;
    const navItems = getNavItems(userRole);

    return (
        <div className={`admin-layout ${isSidebarVisible ? 'sidebar-visible' : ''}`}>
            {isSidebarVisible && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <Leaf size={24} className="logo-icon" />
                    <h1 className="title">Hidra</h1>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map(item => {
                        const isActive = item.match === 'startsWith'
                            ? location.pathname.startsWith(item.to)
                            : location.pathname === item.to;
                        const Icon = item.icon;
                        return (
                            <Link key={item.to} to={item.to} className={isActive ? 'active' : ''}>
                                <Icon size={18} /> <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>
            <main className="main-content">
                <Toaster richColors position="top-right" />
                <header className="main-header">
                    <button className="mobile-menu-button" onClick={toggleSidebar}>
                        <Menu size={20} />
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

