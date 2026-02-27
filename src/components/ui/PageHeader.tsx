// src/components/ui/PageHeader.tsx
//
// Encabezado estándar de páginas.
// Reemplazará los patrones .page-header + .header-title + .header-subtitle
// de FarmManagement.css y UserManagement.css en la fase de migración.

import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import './PageHeader.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Slot derecho — típicamente el botón "Crear X" */
  action?: ReactNode;
  className?: string;
}

const PageHeader = ({ title, subtitle, action, className }: PageHeaderProps) => (
  <div className={cn('ui-page-header', className)}>
    <div className="ui-page-header__text">
      <h1 className="ui-page-header__title">{title}</h1>
      {subtitle && <p className="ui-page-header__subtitle">{subtitle}</p>}
    </div>
    {action && <div className="ui-page-header__action">{action}</div>}
  </div>
);

export default PageHeader;
