// src/components/ui/EmptyState.tsx

import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import './EmptyState.css';

interface EmptyStateProps {
  /** Ícono o ilustración. Acepta cualquier ReactNode, típicamente <LucideIcon /> */
  icon?: ReactNode;
  /** Texto principal */
  title: string;
  /** Descripción de apoyo */
  subtitle?: string;
  /** Elemento de acción opcional (ej: <button>Crear finca</button>) */
  action?: ReactNode;
  className?: string;
}

const EmptyState = ({
  icon,
  title,
  subtitle,
  action,
  className,
}: EmptyStateProps) => (
  <div className={cn('empty-state', className)}>
    {icon && (
      <div className="empty-state__icon-wrapper" aria-hidden="true">
        {icon}
      </div>
    )}
    <p className="empty-state__title">{title}</p>
    {subtitle && <p className="empty-state__subtitle">{subtitle}</p>}
    {action && <div className="empty-state__action">{action}</div>}
  </div>
);

export default EmptyState;
