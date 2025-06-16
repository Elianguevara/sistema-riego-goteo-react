import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './ProfileMenu.css'; // Crearemos este archivo a continuación

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Lógica para cerrar el menú si se hace clic fuera de él (igual que en UserActionsMenu)
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
      {/* Este es el botón que muestra la información del usuario y abre el menú */}
      <button className="profile-menu-trigger" onClick={() => setIsOpen(!isOpen)}>
        <div className="avatar">EG</div>
        <div className="user-info">
            <span className="user-name">Elian Guevara</span>
            <span className="user-role">Administrador</span>
        </div>
        <i className={`fas fa-chevron-down arrow-icon ${isOpen ? 'open' : ''}`}></i>
      </button>

      {/* Menú desplegable que aparece y desaparece */}
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