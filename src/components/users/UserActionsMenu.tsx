import { useState, useRef, useEffect } from 'react';
import './UserActionsMenu.css';

interface UserActionsMenuProps {
  onEdit: () => void;
  onChangePassword: () => void;
  onDelete: () => void;
}

const UserActionsMenu = ({ onEdit, onChangePassword, onDelete }: UserActionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    <div className="actions-menu" ref={menuRef}>
      <button className="actions-menu-button" onClick={() => setIsOpen(!isOpen)}>
        <i className="fas fa-ellipsis-v"></i>
      </button>
      {isOpen && (
        <div className="dropdown-content">
          <a href="#" onClick={(e) => { e.preventDefault(); onEdit(); setIsOpen(false); }}>Editar Perfil</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onChangePassword(); setIsOpen(false); }}>Cambiar Contraseña</a>
          <a href="#" className="delete" onClick={(e) => { e.preventDefault(); onDelete(); setIsOpen(false); }}>Eliminar Usuario</a>
        </div>
      )}
    </div>
  );
};

export default UserActionsMenu;