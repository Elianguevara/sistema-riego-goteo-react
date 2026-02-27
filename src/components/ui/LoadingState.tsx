// src/components/ui/LoadingState.tsx

import { cn } from '../../utils/cn';
import './LoadingState.css';

interface LoadingStateProps {
  /** Texto descriptivo del proceso en curso */
  message?: string;
  /** Si es true, el contenedor ocupa toda la altura del viewport */
  fullPage?: boolean;
  className?: string;
}

const LoadingState = ({
  message = 'Cargando...',
  fullPage = false,
  className,
}: LoadingStateProps) => (
  <div
    className={cn('loading-state', fullPage && 'loading-state--full-page', className)}
    role="status"
    aria-label={message}
  >
    <div className="loading-state__spinner" aria-hidden="true">
      <div className="loading-state__ring" />
    </div>
    {message && <p className="loading-state__message">{message}</p>}
  </div>
);

export default LoadingState;
