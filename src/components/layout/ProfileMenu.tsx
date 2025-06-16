import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { useAuthData } from '../../hooks/useAuthData'; // <-- 1. Importa el hook
import './ProfileMenu.css';

// Función helper para obtener las iniciales del nombre de usuario
const getInitials = (name: string = '') => {
  return name.substring(0, 2).toUpperCase();
};

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const authData = useAuthData(); // <-- 2. Usa el hook para obtener los datos

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
        {/* 3. Usa los datos del hook para el avatar */}
        <div className="avatar">{getInitials(authData?.username)}</div>
        <div className="user-info">
            {/* 4. Usa los datos del hook para el nombre y el rol */}
            <span className="user-name">{authData?.username ?? 'Usuario'}</span>
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