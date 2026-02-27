// src/components/ui/ActionsMenu.tsx

import { useState, useRef, useEffect } from 'react';
import './ActionsMenu.css';
import { MoreVertical } from 'lucide-react';

// Definimos el tipo para cada item del menú
export interface ActionMenuItem {
  label: string;
  action: () => void;
  className?: string; // Para clases opcionales como 'delete'
}

interface ActionsMenuProps {
  items: ActionMenuItem[];
}

const ActionsMenu = ({ items }: ActionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cierra el menú si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="actions-menu" ref={menuRef}>
      <button className="actions-menu-button" onClick={() => setIsOpen(!isOpen)} aria-label="Abrir menú de acciones">
        <MoreVertical size={16} />
      </button>
      {isOpen && (
        <div className="dropdown-content">
          {items.map((item, index) => (
            <button 
              key={index} 
              onClick={() => handleItemClick(item.action)}
              className={item.className}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionsMenu;