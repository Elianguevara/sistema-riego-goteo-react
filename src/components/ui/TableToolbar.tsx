// src/components/ui/TableToolbar.tsx
//
// Barra de herramientas superior de tablas/grillas.
// Reemplazará el patrón .filters-bar de FarmManagement.css
// y .search-container de Dashboard.css en la fase de migración.

import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../utils/cn';
import './TableToolbar.css';

interface TableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /**
   * Slot derecho — controles adicionales como view-toggle, filtros, etc.
   * Se renderiza a la derecha del campo de búsqueda.
   */
  children?: ReactNode;
  className?: string;
}

const TableToolbar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  children,
  className,
}: TableToolbarProps) => (
  <div className={cn('ui-table-toolbar', className)}>
    <div className="ui-table-toolbar__search-wrapper">
      <Search
        className="ui-table-toolbar__search-icon"
        size={16}
        aria-hidden="true"
      />
      <input
        type="text"
        className="ui-table-toolbar__search-input"
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label={searchPlaceholder}
      />
    </div>

    {children && (
      <div className="ui-table-toolbar__controls">{children}</div>
    )}
  </div>
);

export default TableToolbar;
