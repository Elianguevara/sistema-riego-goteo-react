import { useState, useEffect } from 'react';

/**
 * Un custom hook que retrasa la actualización de un valor (debounce).
 * Es ideal para evitar llamadas a la API en cada pulsación de tecla en un campo de búsqueda.
 * @param value El valor que se quiere "retrasar".
 * @param delay El tiempo de espera en milisegundos.
 * @returns El valor "retrasado".
 */
export function useDebounce<T>(value: T, delay: number): T {
  // Estado para guardar el valor después del retraso
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Se crea un temporizador que actualizará el estado después del 'delay'
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Se limpia el temporizador si el valor cambia antes de que se cumpla el delay.
    // Esto es lo que evita que se ejecute en cada tecleo.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Solo se vuelve a ejecutar si el valor o el delay cambian

  return debouncedValue;
}
