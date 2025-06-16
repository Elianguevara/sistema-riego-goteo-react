import { useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import authService from '../services/authService';
import type { DecodedToken } from '../types/auth.types';

/**
 * Custom hook para obtener y decodificar la información del token de autenticación.
 * @returns Un objeto con los datos del usuario o null si no está autenticado.
 */
export const useAuthData = () => {
  const token = authService.getToken();

  // Usamos useMemo para evitar decodificar el token en cada renderizado,
  // solo se recalculará si el token cambia.
  const userData = useMemo(() => {
    if (!token) {
      return null;
    }
    try {
      const decodedToken: DecodedToken = jwtDecode(token);
      return {
        username: decodedToken.sub,
        role: decodedToken.rol,
      };
    } catch (error) {
      console.error("Error al decodificar el token en useAuthData:", error);
      return null;
    }
  }, [token]);

  return userData;
};