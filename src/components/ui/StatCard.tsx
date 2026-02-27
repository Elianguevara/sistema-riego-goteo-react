// src/components/ui/StatCard.tsx
//
// Unifica los tres patrones de KPI card presentes en la app:
//   - Dashboard.tsx       → iconPosition='left',  iconStyle='gradient', onClick
//   - FarmManagement.tsx  → iconPosition='right', iconStyle='gradient'
//   - AnalystDashboard.tsx → iconPosition='right', iconStyle='light', subtitle

import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import './StatCard.css';

export type StatCardVariant = 'primary' | 'info' | 'warning' | 'danger' | 'accent' | 'cyan';

interface StatCardProps {
  /** Etiqueta descriptiva (ej: "Total de Fincas") */
  label: string;
  /** Valor principal a destacar */
  value: string | number;
  /** Ícono — típicamente un componente Lucide */
  icon: ReactNode;
  /** Determina el color del icono y el acento activo */
  variant?: StatCardVariant;
  /** Texto secundario bajo el valor (ej: porcentaje del total) */
  subtitle?: string;
  /** Posición del ícono respecto al texto */
  iconPosition?: 'left' | 'right';
  /**
   * - 'gradient' → fondo degradado opaco (Dashboard / FarmManagement)
   * - 'light'    → fondo suave con ícono coloreado (AnalystDashboard)
   */
  iconStyle?: 'gradient' | 'light';
  /** Estado activo — resalta la tarjeta seleccionada (Dashboard) */
  isActive?: boolean;
  /** Hace la tarjeta interactiva (teclado + puntero) */
  onClick?: () => void;
  className?: string;
}

const StatCard = ({
  label,
  value,
  icon,
  variant = 'primary',
  subtitle,
  iconPosition = 'right',
  iconStyle = 'gradient',
  isActive = false,
  onClick,
  className,
}: StatCardProps) => {
  const isInteractive = Boolean(onClick);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={cn(
        'ui-stat-card',
        `ui-stat-card--icon-${iconPosition}`,
        isInteractive && 'ui-stat-card--interactive',
        isActive && 'ui-stat-card--active',
        className,
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-pressed={isInteractive ? isActive : undefined}
    >
      <div className="ui-stat-card__text">
        <p className="ui-stat-card__label">{label}</p>
        <p className="ui-stat-card__value">{value}</p>
        {subtitle && <p className="ui-stat-card__subtitle">{subtitle}</p>}
      </div>

      <div
        className={cn(
          'ui-stat-card__icon',
          `ui-stat-card__icon--${variant}`,
          iconStyle === 'light' && 'ui-stat-card__icon--light',
        )}
        aria-hidden="true"
      >
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
