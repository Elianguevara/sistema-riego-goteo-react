// src/components/ui/Modal.tsx

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  /**
   * Llamado al presionar Escape o al hacer clic en el overlay.
   * Si no se provee, el modal no se puede cerrar desde afuera del contenido.
   */
  onClose?: () => void;
  /** Ancho máximo del contenedor del modal */
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
}

const Modal = ({ isOpen, onClose, size = 'md', children, className }: ModalProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Cierra con Escape
  useEffect(() => {
    if (!isOpen || !onClose) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Bloquea el scroll del body y mueve el foco al contenedor
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    containerRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClose && e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="ui-modal__overlay"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        ref={containerRef}
        className={cn(
          'ui-modal__container',
          `ui-modal__container--${size}`,
          className,
        )}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
