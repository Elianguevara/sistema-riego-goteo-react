// src/hooks/useAuthData.ts

import { useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import authService from '../services/authService';
import type { DecodedToken } from '../types/auth.types';

export const useAuthData = () => {
  const token = authService.getToken();

  const userData = useMemo(() => {
    if (!token) {
      return null;
    }
    try {
      const decodedToken: DecodedToken = jwtDecode(token);
      return {
        username: decodedToken.sub,
        role: decodedToken.rol,
        name: decodedToken.name, // <-- AÑADIR ESTA LÍNEA
      };
    } catch (error) {
      console.error("Error al decodificar el token en useAuthData:", error);
      return null;
    }
  }, [token]);

  return userData;
};