// src/components/ui/ErrorState.tsx

import { AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';
import './ErrorState.css';

interface ErrorStateProps {
  /** Mensaje de error a mostrar */
  message: string;
  /** Título del estado de error */
  title?: string;
  /** Si se provee, muestra un botón para reintentar la operación */
  onRetry?: () => void;
  /** Texto personalizado del botón de reintento */
  retryLabel?: string;
  className?: string;
}

const ErrorState = ({
  message,
  title = 'Ocurrió un error',
  onRetry,
  retryLabel = 'Reintentar',
  className,
}: ErrorStateProps) => (
  <div className={cn('error-state', className)} role="alert">
    <AlertTriangle className="error-state__icon" size={40} aria-hidden="true" />
    <p className="error-state__title">{title}</p>
    <p className="error-state__message">{message}</p>
    {onRetry && (
      <button className="error-state__retry" onClick={onRetry} type="button">
        {retryLabel}
      </button>
    )}
  </div>
);

export default ErrorState;
