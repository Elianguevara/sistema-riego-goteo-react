// src/components/ui/Badge.tsx
//
// Etiqueta de estado semántica.
// Unifica .status-badge-card, .status-badge-list y los status badges
// inline dispersos en el resto de la app.

import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import './Badge.css';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'accent'
  | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  /** sm = para celdas de tabla / listas; md = para encabezados de tarjetas */
  size?: 'sm' | 'md';
  children: ReactNode;
  className?: string;
}

const Badge = ({
  variant = 'neutral',
  size = 'sm',
  children,
  className,
}: BadgeProps) => (
  <span
    className={cn(
      'ui-badge',
      `ui-badge--${variant}`,
      size === 'md' && 'ui-badge--md',
      className,
    )}
  >
    {children}
  </span>
);

export default Badge;
