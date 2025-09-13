// src/components/layout/ProfileMenu.tsx

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { useAuthData } from '../../hooks/useAuthData';
import './ProfileMenu.css';

// Función helper mejorada para obtener iniciales
const getInitials = (name: string = '') => {
  if (!name) return '?';
  const nameParts = name.split(' ');
  const firstNameInitial = nameParts[0] ? nameParts[0][0] : '';
  const lastNameInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : '';
  return `${firstNameInitial}${lastNameInitial}`.toUpperCase();
};

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const authData = useAuthData();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="profile-menu-container" ref={menuRef}>
      <button className="profile-menu-trigger" onClick={() => setIsOpen(!isOpen)}>
        {/* Usar el nombre para las iniciales */}
        <div className="avatar">{getInitials(authData?.name)}</div>
        <div className="user-info">
            {/* Mostrar el nombre en lugar del username */}
            <span className="user-name">{authData?.name ?? 'Usuario'}</span>
            <span className="user-role">{authData?.role ?? 'Invitado'}</span>
        </div>
        <i className={`fas fa-chevron-down arrow-icon ${isOpen ? 'open' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          <Link to="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <i className="fas fa-user-circle"></i>
            <span>Perfil de Usuario</span>
          </Link>
          <button className="dropdown-item" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;